const UserStreak = require("../models/UserStreak");

const getUtcDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const previousUtcDateKey = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return getUtcDateKey(date);
};

const calculateStreakUpdate = (streak, activityDate) => {
  const currentStreak = Number(streak?.currentStreak || 0);
  const longestStreak = Number(streak?.longestStreak || 0);

  if (streak?.lastActivityDate === activityDate) {
    return { changed: false, currentStreak, longestStreak, lastActivityDate: activityDate };
  }

  const nextCurrentStreak =
    streak?.lastActivityDate === previousUtcDateKey(activityDate)
      ? currentStreak + 1
      : 1;

  return {
    changed: true,
    currentStreak: nextCurrentStreak,
    longestStreak: Math.max(longestStreak, nextCurrentStreak),
    lastActivityDate: activityDate,
  };
};

const recordDailyActivity = async (userId, now = new Date()) => {
  const activityDate = getUtcDateKey(now);
  const existingToday = await UserStreak.findOne({
    user: userId,
    lastActivityDate: activityDate,
  });

  if (existingToday) return existingToday;

  const updated = await UserStreak.findOneAndUpdate(
    { user: userId, lastActivityDate: { $ne: activityDate } },
    [
      {
        $set: {
          currentStreak: {
            $cond: [
              { $eq: ["$lastActivityDate", previousUtcDateKey(activityDate)] },
              { $add: [{ $ifNull: ["$currentStreak", 0] }, 1] },
              1,
            ],
          },
          lastActivityDate: activityDate,
          lastActivityAt: now,
        },
      },
      {
        $set: {
          longestStreak: {
            $max: [{ $ifNull: ["$longestStreak", 0] }, "$currentStreak"],
          },
        },
      },
    ],
    { returnDocument: "after" }
  );

  if (updated) return updated;

  try {
    return await UserStreak.create({
      user: userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: activityDate,
      lastActivityAt: now,
    });
  } catch (error) {
    // A simultaneous first activity may win the unique-index race. Return its
    // result instead of applying a second increment.
    if (error?.code === 11000) {
      const racedStreak = await UserStreak.findOne({ user: userId });
      if (racedStreak) return racedStreak;
    }
    throw error;
  }
};

module.exports = {
  getUtcDateKey,
  previousUtcDateKey,
  calculateStreakUpdate,
  recordDailyActivity,
};
