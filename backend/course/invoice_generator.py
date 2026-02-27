"""
Professional Invoice PDF Generator using ReportLab
Generates beautiful invoices with company details, tables, and proper styling
"""

from io import BytesIO
from datetime import datetime
from django.conf import settings

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


def generate_professional_invoice(order, enrollment, payment, installment_number):
    """
    Generate a professional-looking invoice PDF using ReportLab
    
    Args:
        order: Order object
        enrollment: EnrolledUser object
        payment: Payment object
        installment_number: Which installment (1, 2, or 3)
    
    Returns:
        bytes: PDF file content
    """
    
    # Create PDF buffer
    buffer = BytesIO()
    
    # Determine currency based on user country
    user_country = (getattr(enrollment.user, 'country', '') or '').upper()
    is_indian = user_country in ['INDIA', 'IN']
    currency = '₹' if is_indian else '$'
    
    # Determine installment text
    if installment_number == 1:
        installment_text = f"First installment paid (1 of {enrollment.no_of_installments})"
    elif installment_number == 2:
        installment_text = f"Second installment paid (2 of {enrollment.no_of_installments})"
    else:
        installment_text = f"Final installment paid ({enrollment.no_of_installments} of {enrollment.no_of_installments})"
    
    # Create canvas for custom drawing
    c = canvas.Canvas(buffer, pagesize=A4, pageCompression=1)
    c.setTitle("INVOICE")
    
    # Page dimensions
    page_width, page_height = A4
    
    # ==================== HEADER ====================
    # Border
    c.rect(15*mm, 15*mm, page_width - 30*mm, page_height - 30*mm, stroke=1, fill=0)
    
    # Company Header
    c.setFont("Helvetica-Bold", 24)
    c.setFillColorRGB(0.17, 0.31, 0.57)  # Deep blue
    c.drawString(25*mm, page_height - 35*mm, "DEEP EIGEN")
    
    c.setFont("Helvetica", 10)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawString(25*mm, page_height - 42*mm, "Professional Learning Platform")
    c.drawString(25*mm, page_height - 48*mm, "📧 contact@deepeigen.com | 🌐 www.deepeigen.com")
    
    # Invoice Title (Right aligned)
    c.setFont("Helvetica-Bold", 28)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawRightString(page_width - 25*mm, page_height - 35*mm, "INVOICE")
    
    c.setFont("Helvetica-Bold", 12)
    c.setFillColorRGB(0.9, 0.1, 0.1)  # Red
    invoice_number = f"{order.order_number}_{payment.payment_id[-6:]}"
    c.drawRightString(page_width - 25*mm, page_height - 42*mm, invoice_number)
    
    # ==================== INVOICE DETAILS ====================
    y_pos = page_height - 65*mm
    
    # Section 1: Bill To
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.17, 0.31, 0.57)
    c.drawString(25*mm, y_pos, "BILL TO")
    
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    y_pos -= 5*mm
    c.drawString(25*mm, y_pos, f"{order.first_name} {order.last_name}")
    y_pos -= 4*mm
    c.drawString(25*mm, y_pos, order.email)
    y_pos -= 4*mm
    c.drawString(25*mm, y_pos, f"{order.city}, {order.state}, {order.country}")
    y_pos -= 4*mm
    c.drawString(25*mm, y_pos, f"PIN: {order.zipcode}")
    
    # Section 2: Invoice Details (Center)
    center_x = page_width / 2 - 15*mm
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.17, 0.31, 0.57)
    c.drawString(center_x, page_height - 65*mm, "INVOICE DETAILS")
    
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    y_pos = page_height - 70*mm
    c.drawString(center_x, y_pos, f"Order #: {order.order_number}")
    y_pos -= 4*mm
    c.drawString(center_x, y_pos, f"Date: {datetime.now().strftime('%d %B %Y')}")
    y_pos -= 4*mm
    c.drawString(center_x, y_pos, f"Status: Paid")
    
    # Section 3: Payment Info (Right)
    right_x = page_width - 85*mm
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.17, 0.31, 0.57)
    c.drawString(right_x, page_height - 65*mm, "PAYMENT INFO")
    
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    y_pos = page_height - 70*mm
    c.drawString(right_x, y_pos, f"Payment ID: {payment.payment_id}")
    y_pos -= 4*mm
    c.drawString(right_x, y_pos, f"Status: ✓ Completed")
    
    # ==================== PAYMENT STATUS BADGE ====================
    y_pos = page_height - 95*mm
    
    # Green badge background
    c.setFillColorRGB(0.8, 0.95, 0.85)
    c.rect(25*mm, y_pos - 8*mm, page_width - 50*mm, 10*mm, fill=1, stroke=1)
    c.setStrokeColorRGB(0.3, 0.7, 0.3)
    
    c.setFont("Helvetica-Bold", 11)
    c.setFillColorRGB(0.2, 0.6, 0.2)
    c.drawString(30*mm, y_pos - 5*mm, "✓ Payment Received Successfully")
    
    # ==================== INVOICE ITEMS TABLE ====================
    y_pos = page_height - 110*mm
    
    # Table data
    table_data = [
        ['#', 'Description', 'Installment', 'Amount'],
        ['1', enrollment.course.title, installment_text, f'{currency} {order.total_amount:.2f}'],
    ]
    
    # Create table
    table = Table(
        table_data,
        colWidths=[10*mm, 120*mm, 50*mm, 40*mm],
        rowHeights=[10*mm, 15*mm]
    )
    
    # Style table
    table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4F8F')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        
        # Body styling
        ('ALIGN', (0, 1), (-1, 1), 'LEFT'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, 1), 9),
        ('ALIGN', (-1, 1), (-1, 1), 'RIGHT'),
        ('FONTNAME', (-1, 1), (-1, 1), 'Helvetica-Bold'),
        
        # Borders
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    
    # Draw table at specific position
    table.wrapOn(c, page_width - 50*mm, 0)
    table.drawOn(c, 25*mm, y_pos - 35*mm)
    
    # ==================== PAYMENT SUMMARY ====================
    y_pos -= 50*mm
    
    # Summary box background
    c.setFillColorRGB(0.95, 0.95, 0.95)
    c.rect(25*mm, y_pos - 45*mm, 150*mm, 50*mm, fill=1, stroke=1)
    c.setStrokeColorRGB(0.17, 0.31, 0.57)
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.17, 0.31, 0.57)
    c.drawString(30*mm, y_pos - 8*mm, "PAYMENT SUMMARY")
    
    # Summary lines
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    
    line_y = y_pos - 15*mm
    c.drawString(30*mm, line_y, "Subtotal:")
    c.drawRightString(170*mm, line_y, f"{currency} {order.total_amount:.2f}")
    
    line_y -= 6*mm
    c.drawString(30*mm, line_y, "Tax:")
    c.drawRightString(170*mm, line_y, f"{currency} 0.00")
    
    # Total line with border
    line_y -= 8*mm
    c.setLineWidth(1)
    c.line(30*mm, line_y + 2*mm, 170*mm, line_y + 2*mm)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColorRGB(0.17, 0.31, 0.57)
    c.drawString(30*mm, line_y - 3*mm, "Total Amount Paid:")
    c.drawRightString(170*mm, line_y - 3*mm, f"{currency} {order.total_amount:.2f}")
    
    # ==================== FOOTER ====================
    y_pos = 30*mm
    
    # Footer line
    c.setLineWidth(1)
    c.setStrokeColorRGB(0.7, 0.7, 0.7)
    c.line(25*mm, y_pos, page_width - 25*mm, y_pos)
    
    # Footer text
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawCentredString(page_width / 2, y_pos - 5*mm, "Thank you for your purchase! You now have access to the course materials.")
    c.drawCentredString(page_width / 2, y_pos - 9*mm, "For queries, contact: support@deepeigen.com | Company PAN: AAICD5934H | CIN: U80900MP2021PTC056553")
    c.drawCentredString(page_width / 2, y_pos - 13*mm, "This is an automatically generated invoice. Computer generated - signature not required.")
    
    # Show page and save
    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()
