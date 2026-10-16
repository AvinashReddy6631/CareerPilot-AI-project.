const PRACTICE_URLS = {
  leetCode: "https://leetcode.com/problemset/",
  geeksForGeeks: "https://www.geeksforgeeks.org/explore",
  hackerRank: "https://www.hackerrank.com/domains/algorithms",
  codeforces: "https://codeforces.com/problemset",
};

const youtubeSearch = (query) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `data structures algorithms ${query} tutorial`
  )}`;

const createTopic = (
  id,
  name,
  description,
  difficulty,
  estimatedTime,
  practiceUrl,
  notes = ""
) => ({
  id,
  name,
  description,
  difficulty,
  estimatedTime,
  // Search URLs avoid guessed or fabricated YouTube video IDs. Replace these
  // with curated, verified lesson URLs whenever they are available.
  youtubeUrl: youtubeSearch(name),
  practiceUrl,
  notes,
  additionalResources: [
    { label: "GeeksforGeeks DSA", url: "https://www.geeksforgeeks.org/dsa/" },
  ],
});

// This is the single source of truth for the DSA curriculum and its resource
// links. Update this file to add topics or replace resource destinations.
const DSA_TOPICS = [
  createTopic("programming-fundamentals-time-complexity", "Programming Fundamentals and Time Complexity", "Build the foundations for efficient code and reasoning about its cost.", "Beginner", "6–8 hours", PRACTICE_URLS.hackerRank, "Focus on Big O, input constraints, and tracing simple loops."),
  createTopic("arrays", "Arrays", "Learn traversal, in-place updates, subarrays, and common array patterns.", "Beginner", "8–10 hours", PRACTICE_URLS.leetCode, "Start with traversal and prefix patterns before harder optimizations."),
  createTopic("strings", "Strings", "Work with character sequences, frequency maps, palindromes, and parsing.", "Beginner", "6–8 hours", PRACTICE_URLS.leetCode),
  createTopic("linked-lists", "Linked Lists", "Understand pointers, insertion, deletion, reversal, and cycle detection.", "Intermediate", "8–10 hours", PRACTICE_URLS.leetCode),
  createTopic("stacks", "Stacks", "Use LIFO structures for expression parsing, monotonic stacks, and undo patterns.", "Intermediate", "5–7 hours", PRACTICE_URLS.geeksForGeeks),
  createTopic("queues", "Queues", "Practice FIFO processing, circular queues, deques, and scheduling patterns.", "Intermediate", "5–7 hours", PRACTICE_URLS.geeksForGeeks),
  createTopic("hashing", "Hashing", "Use hash maps and sets for constant-time lookups, grouping, and counting.", "Intermediate", "6–8 hours", PRACTICE_URLS.leetCode),
  createTopic("two-pointers", "Two Pointers", "Solve sorted-array and string problems by moving two coordinated pointers.", "Intermediate", "5–7 hours", PRACTICE_URLS.leetCode),
  createTopic("sliding-window", "Sliding Window", "Recognize fixed and variable windows for efficient contiguous-range problems.", "Intermediate", "6–8 hours", PRACTICE_URLS.leetCode),
  createTopic("prefix-sums", "Prefix Sums", "Precompute cumulative values to answer range queries efficiently.", "Intermediate", "4–6 hours", PRACTICE_URLS.codeforces),
  createTopic("binary-search", "Binary Search", "Apply binary search to sorted data and answer-space optimization.", "Intermediate", "7–9 hours", PRACTICE_URLS.leetCode),
  createTopic("recursion-backtracking", "Recursion and Backtracking", "Break problems into smaller calls and systematically explore choices.", "Intermediate", "8–10 hours", PRACTICE_URLS.leetCode),
  createTopic("sorting-algorithms", "Sorting Algorithms", "Compare sorting strategies and understand their time and space trade-offs.", "Intermediate", "7–9 hours", PRACTICE_URLS.hackerRank),
  createTopic("binary-trees", "Binary Trees", "Traverse and reason about hierarchical data with depth-first and breadth-first search.", "Intermediate", "9–12 hours", PRACTICE_URLS.leetCode),
  createTopic("binary-search-trees", "Binary Search Trees", "Use ordered tree properties for search, insertion, deletion, and range queries.", "Intermediate", "7–9 hours", PRACTICE_URLS.leetCode),
  createTopic("heaps-priority-queues", "Heaps and Priority Queues", "Prioritize data efficiently for top-k, scheduling, and stream problems.", "Intermediate", "7–9 hours", PRACTICE_URLS.leetCode),
  createTopic("greedy-algorithms", "Greedy Algorithms", "Make locally optimal choices while proving why they lead to a global solution.", "Advanced", "8–10 hours", PRACTICE_URLS.codeforces),
  createTopic("graphs", "Graphs", "Model connected systems and solve traversal, shortest path, and connectivity problems.", "Advanced", "12–15 hours", PRACTICE_URLS.leetCode),
  createTopic("dynamic-programming", "Dynamic Programming", "Turn overlapping subproblems into reusable states with memoization and tabulation.", "Advanced", "14–18 hours", PRACTICE_URLS.leetCode),
  createTopic("tries-advanced-data-structures", "Tries and Advanced Data Structures", "Explore prefix trees and advanced structures for specialized search and query needs.", "Advanced", "10–12 hours", PRACTICE_URLS.codeforces),
];

const isSafeResourceUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      Boolean(parsed.hostname) &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
};

const getTotalConfiguredResources = () =>
  DSA_TOPICS.reduce((total, topic) => {
    const primary = [topic.youtubeUrl, topic.practiceUrl].filter(isSafeResourceUrl).length;
    const extras = (topic.additionalResources || []).filter((resource) =>
      isSafeResourceUrl(resource?.url)
    ).length;
    return total + primary + extras;
  }, 0);

module.exports = {
  DSA_TOPICS,
  isSafeResourceUrl,
  getTotalConfiguredResources,
};
