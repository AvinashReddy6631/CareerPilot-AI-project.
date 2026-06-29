import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportResumePdf(element, fileName = "Resume") {
  try {
    if (!element) {
      throw new Error("Resume element not found.");
    }

    const canvas = await html2canvas(element, {
  scale: 2,
  useCORS: true,
  allowTaint: true,
  backgroundColor: "#ffffff",
  logging: false,
  scrollX: 0,
  scrollY: -window.scrollY,
  windowWidth: element.scrollWidth,
  windowHeight: element.scrollHeight,
  foreignObjectRendering: false,
  removeContainer: true,
});
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName.replace(/\s+/g, "_")}_Resume.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
}
