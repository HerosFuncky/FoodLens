import fitz
doc = fitz.open("FoodLens_presentation.pdf")
print("pages:", doc.page_count)
for i, page in enumerate(doc, 1):
    pix = page.get_pixmap(dpi=110)
    pix.save(f"slide-{i:02d}.png")
print("rendered")
