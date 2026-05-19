import { jsPDF } from 'jspdf'
import type { Results } from './auditEngine'

/**
 * Generates a highly stylized, professional multi-page PDF Audit Report.
 * Returns the jsPDF instance (for download) and a base64 string (for emailing).
 */
export function generateAuditPDF(company: string, results: Results): { doc: jsPDF; base64: string } {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  let y = 0

  // Helper function to draw the page header and footer
  const drawPageShell = (pageNum: number, totalPages: number) => {
    // Top primary header banner
    doc.setFillColor(79, 70, 229) // Indigo (#4f46e5)
    doc.rect(0, 0, pageWidth, 25, 'F')

    // Accent line
    doc.setFillColor(217, 70, 239) // Fuchsia (#d946ef)
    doc.rect(0, 25, pageWidth, 2, 'F')

    // Header branding
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('SpendSight AI', margin, 17)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Executive Cost Optimization Report', pageWidth - margin - 55, 17)

    // Footer
    doc.setFillColor(248, 250, 252) // Slate 50
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
    doc.setDrawColor(226, 232, 240) // Slate 200
    doc.line(0, pageHeight - 15, pageWidth, pageHeight - 15)

    doc.setTextColor(100, 116, 139) // Slate 500
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('CONFIDENTIAL - SPENDSIGHT AI AUDIT', margin, pageHeight - 7)

    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 7)
  }

  // --- PAGE 1: TITLE & SUMMARY ---
  y = 45

  // Report title block
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text('AI Spend Audit', margin, y)
  
  y += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 70, 229) // Indigo
  doc.text(`PREPARED FOR: ${company.toUpperCase()}`, margin, y)

  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139) // Slate 500
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.text(`Date generated: ${dateStr}`, margin, y)

  // Savings Summary Hero Card
  y += 15
  doc.setFillColor(243, 244, 246) // Gray 100
  doc.roundedRect(margin, y, contentWidth, 42, 6, 6, 'F')
  
  // Left border gradient highlight
  doc.setFillColor(79, 70, 229) // Indigo
  doc.rect(margin, y, 3, 42, 'F')

  // Financial Stats inside the card
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('ESTIMATED MONTHLY SAVINGS', margin + 10, y + 12)

  doc.setTextColor(15, 23, 42) // Slate 900
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  doc.text(`$${results.totalSavings.toFixed(0)}`, margin + 10, y + 27)

  doc.setTextColor(217, 70, 239) // Fuchsia
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`${results.percentage.toFixed(1)}% Cost Reduction`, margin + 10, y + 36)

  // Right Side: Quick comparison stats
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Current Spend:', pageWidth - margin - 60, y + 14)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text(`$${results.totalCurrentSpend.toFixed(0)}/mo`, pageWidth - margin - 35, y + 14)

  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Optimized Spend:', pageWidth - margin - 60, y + 22)
  doc.setTextColor(16, 185, 129) // Emerald 500
  doc.setFont('helvetica', 'bold')
  doc.text(`$${results.totalOptimizedSpend.toFixed(0)}/mo`, pageWidth - margin - 35, y + 22)

  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text('Annualized Savings:', pageWidth - margin - 60, y + 30)
  doc.setTextColor(79, 70, 229) // Indigo
  doc.setFont('helvetica', 'bold')
  doc.text(`$${(results.totalSavings * 12).toFixed(0)}/yr`, pageWidth - margin - 35, y + 30)

  // Executive AI-Generated Strategy section
  y += 58
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Executive Optimization Strategy', margin, y)

  y += 2
  doc.setFillColor(79, 70, 229)
  doc.rect(margin, y, 20, 1, 'F')

  y += 8
  doc.setTextColor(51, 65, 85) // Slate 700
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  // Wrap and print summary text
  const summaryLines = doc.splitTextToSize(results.summary || 'Summary unavailable.', contentWidth)
  doc.text(summaryLines, margin, y)

  // Determine total pages count (usually 2 or 3 pages depending on count of optimizations)
  const totalPages = results.optimizations.length > 3 ? 3 : 2
  
  // Draw shell for page 1
  drawPageShell(1, totalPages)

  // --- PAGE 2: OPPORTUNITIES BREAKDOWN ---
  doc.addPage()
  drawPageShell(2, totalPages)

  y = 45
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Detailed Optimization Opportunities', margin, y)

  y += 2
  doc.setFillColor(79, 70, 229)
  doc.rect(margin, y, 20, 1, 'F')

  y += 10

  // Loop through and build card sections for each optimization opportunity
  results.optimizations.forEach((opt) => {
    // Page breaking condition for Page 2 -> Page 3
    if (y > 230 && totalPages === 3) {
      doc.addPage()
      drawPageShell(3, totalPages)
      y = 45
    }

    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240) // Slate 200
    doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'FD')

    // Vertical indicator line for each card
    doc.setFillColor(79, 70, 229)
    doc.rect(margin, y, 2, 38, 'F')

    // Opportunity title
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(`${opt.toolName}: ${opt.recommendation}`, margin + 6, y + 8)

    // Opportunity savings badge
    doc.setFillColor(240, 253, 250) // Emerald 50
    doc.roundedRect(pageWidth - margin - 35, y + 4, 30, 7, 2, 2, 'F')
    doc.setTextColor(4, 120, 87) // Emerald 700
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(`-$${(opt.currentCost - opt.optimizedCost).toFixed(0)}/mo`, pageWidth - margin - 31, y + 9)

    // Opportunity details/bullets
    doc.setTextColor(71, 85, 105) // Slate 600
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    let bulletY = y + 16
    opt.details.forEach(detail => {
      doc.setFillColor(16, 185, 129) // Green dot
      doc.circle(margin + 9, bulletY - 1, 0.8, 'F')
      
      const wrappedDetail = doc.splitTextToSize(detail, contentWidth - 18)
      doc.text(wrappedDetail, margin + 14, bulletY)
      bulletY += 5
    })

    // Cost details row
    doc.setTextColor(148, 163, 184) // Slate 400
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(`Current: $${opt.currentCost.toFixed(0)}/mo   |   Optimized: $${opt.optimizedCost.toFixed(0)}/mo`, margin + 6, y + 33)

    y += 44
  })

  // Final Professional Closing block on the last page
  // If y is close to page footer, push to new page or fit nicely
  if (y > 210) {
    // If we have some space, let's write it down, else push
    if (y > 240 && totalPages === 2) {
      // Re-initialize a 3rd page
      doc.addPage()
      drawPageShell(3, 3)
      y = 45
    }
  }

  // Draw consulting signature/note
  y += 5
  doc.setFillColor(79, 70, 229, 0.05) // Translucent light indigo
  doc.rect(margin, y, contentWidth, 22, 'F')

  doc.setTextColor(79, 70, 229)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Implementation & Next Steps', margin + 5, y + 7)

  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text('All optimization suggestions are calculated on standard seat counts and current API averages.', margin + 5, y + 13)
  doc.text('Please verify exact details before modifying tier billing cycles or API keys.', margin + 5, y + 17)

  // Get raw output
  const base64 = doc.output('datauristring').split(',')[1]

  return { doc, base64 }
}
