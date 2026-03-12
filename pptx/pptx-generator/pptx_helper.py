"""pptx_helper.py — Verified helper functions for python-pptx PPTX generation.

Extracted from Edwards Operation Board `generate-ppt-editable.py`.
Provides reusable building blocks so Claude-generated build scripts stay concise.

Usage:
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'path/to/pptx-generator'))
    from pptx_helper import *
"""

from __future__ import annotations

import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Re-export for convenience
__all__ = [
    # python-pptx types
    "Presentation", "Inches", "Pt", "Emu", "RGBColor",
    "PP_ALIGN", "MSO_ANCHOR", "MSO_SHAPE",
    # Slide dimension constants
    "SLIDE_W", "SLIDE_H",
    # Common colors
    "WHITE", "BLACK",
    # Functions
    "hex_to_rgb", "load_presentation", "get_blank_layout",
    "add_shape", "add_rounded_rect", "set_text", "add_para",
    "textbox", "add_table", "cell", "header_row", "data_row",
    "top_bar", "page_title", "subtitle", "page_num", "footer_line", "callout",
]

# Slide dimensions (16:9)
SLIDE_W = Emu(12192000)
SLIDE_H = Emu(6858000)

# Common colors
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x00, 0x00, 0x00)


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

def hex_to_rgb(hex_str: str) -> RGBColor:
    """Convert '#054E5A' or '054E5A' to RGBColor."""
    h = hex_str.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def load_presentation(template_path: str | None = None) -> Presentation:
    """Load a template PPTX and remove all existing slides.

    If template_path is None or doesn't exist, creates a blank 16:9 presentation.
    """
    if template_path and os.path.exists(template_path):
        prs = Presentation(template_path)
        print(f"Using template: {template_path}")
        # Remove template sample slides
        from pptx.oxml.ns import qn
        sldIdLst = prs.slides._sldIdLst
        for sldId in list(sldIdLst):
            rId = sldId.get(qn("r:id"))
            if rId:
                prs.part.drop_rel(rId)
            sldIdLst.remove(sldId)
        print("Cleared template slides.")
    else:
        prs = Presentation()
        prs.slide_width = SLIDE_W
        prs.slide_height = SLIDE_H
        if template_path:
            print(f"Template not found: {template_path} — using blank presentation")
        else:
            print("Using blank 16:9 presentation")
    return prs


def get_blank_layout(prs: Presentation):
    """Find the 'Blank' slide layout, falling back to first layout."""
    for layout in prs.slide_layouts:
        if layout.name == "Blank":
            return layout
    layout = prs.slide_layouts[0]
    print(f"'Blank' layout not found, using: '{layout.name}'")
    return layout


# ---------------------------------------------------------------------------
# Shape helpers
# ---------------------------------------------------------------------------

def add_shape(slide, left, top, width, height, fill_color=None, line_color=None):
    """Add a rectangle shape. No fill/line by default (transparent)."""
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.line.fill.background()
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.fill.solid()
    return shape


def add_rounded_rect(slide, left, top, width, height, fill_color=None, line_color=None):
    """Add a rounded rectangle shape."""
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.line.fill.background()
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
        shape.line.fill.solid()
    return shape


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def set_text(shape, text, size=12, bold=False, color=None, align=PP_ALIGN.LEFT, font="Segoe UI"):
    """Set text on a shape, clearing any existing content."""
    if color is None:
        color = RGBColor(0x2C, 0x3E, 0x50)
    tf = shape.text_frame
    tf.clear()
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font
    p.alignment = align
    return tf


def add_para(tf, text, size=12, bold=False, color=None, align=PP_ALIGN.LEFT, font="Segoe UI", space_before=0):
    """Add a paragraph to an existing text frame."""
    if color is None:
        color = RGBColor(0x2C, 0x3E, 0x50)
    p = tf.add_paragraph()
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font
    p.alignment = align
    if space_before:
        p.space_before = Pt(space_before)
    return p


def textbox(slide, text, left, top, width, height=Inches(0.4), size=12, bold=False, color=None, align=PP_ALIGN.LEFT, font="Segoe UI"):
    """Add a text box with a single paragraph."""
    if color is None:
        color = RGBColor(0x2C, 0x3E, 0x50)
    box = slide.shapes.add_textbox(left, top, width, height)
    set_text(box, text, size=size, bold=bold, color=color, align=align, font=font)
    box.text_frame.word_wrap = True
    return box


# ---------------------------------------------------------------------------
# Table helpers
# ---------------------------------------------------------------------------

def add_table(slide, rows, cols, left, top, width, height):
    """Add a table and return the Table object."""
    return slide.shapes.add_table(rows, cols, left, top, width, height).table


def cell(table, r, c, text, size=11, bold=False, color=None, bg=None, align=PP_ALIGN.LEFT, font="Segoe UI"):
    """Set cell content with formatting."""
    if color is None:
        color = RGBColor(0x2C, 0x3E, 0x50)
    cl = table.cell(r, c)
    cl.text = ""
    p = cl.text_frame.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font
    p.alignment = align
    cl.vertical_anchor = MSO_ANCHOR.MIDDLE
    if bg:
        cl.fill.solid()
        cl.fill.fore_color.rgb = bg
    cl.margin_left = Emu(91440)
    cl.margin_right = Emu(91440)
    cl.margin_top = Emu(45720)
    cl.margin_bottom = Emu(45720)


def header_row(table, headers, size=11, bg_color=None, text_color=None):
    """Format row 0 as header with primary background and white text."""
    if bg_color is None:
        bg_color = RGBColor(0x05, 0x4E, 0x5A)
    if text_color is None:
        text_color = WHITE
    for i, h in enumerate(headers):
        cell(table, 0, i, h, size=size, bold=True, color=text_color, bg=bg_color, align=PP_ALIGN.CENTER)


def data_row(table, r, data, size=10, colors=None, bolds=None, alt_bg=None):
    """Fill a data row with alternating background.

    alt_bg: tuple of (even_bg, odd_bg) or None for default gray/white.
    """
    if alt_bg:
        bg = alt_bg[1] if r % 2 == 1 else alt_bg[0]
    else:
        bg = RGBColor(0xF4, 0xF6, 0xF8) if r % 2 == 1 else WHITE
    default_color = RGBColor(0x2C, 0x3E, 0x50)
    for i, d in enumerate(data):
        c = colors[i] if colors else default_color
        b = bolds[i] if bolds else False
        cell(table, r, i, d, size=size, bold=b, color=c, bg=bg)


# ---------------------------------------------------------------------------
# Page furniture (configurable via keyword args)
# ---------------------------------------------------------------------------

def top_bar(slide, color=None):
    """Thin accent bar at the top of the slide."""
    if color is None:
        color = RGBColor(0x05, 0x4E, 0x5A)
    add_shape(slide, Emu(0), Emu(0), SLIDE_W, Emu(54000), fill_color=color)


def page_title(slide, text, y=Emu(280000), color=None, accent_color=None, font="Segoe UI Semibold"):
    """Large title with gold underline accent."""
    if color is None:
        color = RGBColor(0x06, 0x31, 0x5B)
    if accent_color is None:
        accent_color = RGBColor(0xE1, 0xB7, 0x7E)
    textbox(slide, text, Emu(500000), y, Emu(10000000), Emu(500000),
            size=24, bold=True, color=color, font=font)
    add_shape(slide, Emu(500000), y + Emu(440000), Emu(700000), Emu(36000), fill_color=accent_color)


def subtitle(slide, text, left, top, width=Emu(5000000), color=None, font="Segoe UI Semibold"):
    """Section subtitle."""
    if color is None:
        color = RGBColor(0x05, 0x4E, 0x5A)
    return textbox(slide, text, left, top, width, Emu(350000),
                   size=16, bold=True, color=color, font=font)


def page_num(slide, num, color=None):
    """Page number in bottom-right corner."""
    if color is None:
        color = RGBColor(0xA1, 0xA9, 0xB4)
    textbox(slide, str(num), Emu(11500000), Emu(6500000), Emu(400000), Emu(250000),
            size=10, color=color, align=PP_ALIGN.RIGHT)


def footer_line(slide, color=None):
    """Thin horizontal line near the bottom."""
    if color is None:
        color = RGBColor(0xDF, 0xE4, 0xE7)
    add_shape(slide, Emu(500000), Emu(6400000), Emu(11200000), Emu(9000), fill_color=color)


def callout(slide, text, left, top, width, height, bg=None, color=None, size=11, bold=False, border_color=None):
    """Rounded rectangle callout box with text."""
    if bg is None:
        bg = RGBColor(0xF4, 0xF6, 0xF8)
    if color is None:
        color = RGBColor(0x2C, 0x3E, 0x50)
    shape = add_rounded_rect(slide, left, top, width, height, fill_color=bg, line_color=border_color)
    tf = set_text(shape, text, size=size, bold=bold, color=color)
    tf.word_wrap = True
    shape.text_frame.margin_left = Emu(150000)
    shape.text_frame.margin_top = Emu(80000)
    shape.text_frame.margin_right = Emu(150000)
    return shape
