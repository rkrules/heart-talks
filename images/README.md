# Heart Talk Images

This directory contains medical and health-related images for the illustrated version of the Heart Talk website.

## Image Sources (Free & Properly Licensed)

### Recommended Sources:
1. **Unsplash** (https://unsplash.com/) - Free high-quality images
   - Search terms: "heart health", "healthy food", "exercise", "medical", "doctor"

2. **Pexels** (https://pexels.com/) - Free stock photos
   - Search terms: "cardiology", "nutrition", "fitness", "wellness"

3. **Pixabay** (https://pixabay.com/) - Free images and illustrations
   - Medical illustrations, health infographics

4. **National Heart, Lung, and Blood Institute** (https://www.nhlbi.nih.gov/health/educational/healthdisp/index.html)
   - Free public domain medical images

## Image Requirements

### Technical Specs:
- **Format**: WebP (preferred) or JPG
- **Max file size**: 200KB per image
- **Dimensions**: 1200x800px recommended
- **Quality**: 80% compression for optimal balance

### Content Guidelines:
- Relevant to chapter topic
- Professional medical imagery
- Diverse representation
- Clear, easy to understand

## Image Mapping

Images are configured in `image-mapping.json` with:
- `src`: Path to image file
- `alt`: Accessibility description
- `caption`: Displayed caption
- `position`: Where to insert (e.g., "after-h3")

## Current Image Needs

Based on `image-mapping.json`:

1. **calcium-heart.jpg** - Heart anatomy with coronary arteries
2. **waist-measurement.jpg** - Waist measurement demonstration
3. **intermittent-fasting.jpg** - Clock showing fasting windows
4. **hdl-cholesterol.jpg** - HDL vs LDL cholesterol diagram
5. **cooking-oils.jpg** - Variety of healthy oils
6. **yoga-tai-chi.jpg** - Mind-body exercise demonstration
7. **plant-protein.jpg** - Plant-based protein foods
8. **ct-scan.jpg** - CT scanner or cardiac CT image
9. **blood-pressure.jpg** - Blood pressure monitor
10. **healthy-carbs.jpg** - Whole grain and complex carb foods

## Optimization Tools

Before adding images, optimize them:

```bash
# Using ImageMagick
convert input.jpg -resize 1200x800 -quality 80 output.jpg

# Using cwebp (for WebP)
cwebp -q 80 input.jpg -o output.webp

# Online: TinyPNG (https://tinypng.com/)
```

## Attribution

If images require attribution, add credits to:
- Image caption
- Footer of illustrated version
- Separate CREDITS.md file

## Testing

After adding images:
1. Check file sizes (should be < 200KB)
2. Test on mobile devices
3. Verify alt text is descriptive
4. Ensure captions are helpful

---

**Note**: The illustrated version is optional. The text-only version is fully functional without these images.
