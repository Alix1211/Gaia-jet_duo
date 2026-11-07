"""Rebuild GAIA JET DUO team sprites without clipping artwork.

Each 3-pose source PNG has THREE large disconnected alpha components, but
the horizontal gaps are not at width/3 or 2*width/3. Reassemble the actual
components into clean, evenly sized sprite cells with generous padding.

This is deterministic image extraction, not generative repainting. Original
artwork remains untouched in assets-source/teams/.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import find_objects, label


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "assets-source" / "teams"
CLEAN = ROOT / "assets-clean" / "teams"
WEBP = ROOT / "assets" / "teams"
PADDING = 56


def extract_major_components(image, expected):
    pixels = np.asarray(image.convert("RGBA"))
    alpha = pixels[:, :, 3] > 0
    labels, count = label(alpha, structure=np.ones((3, 3), dtype=np.uint8))
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    selected = sorted(np.argsort(sizes)[-expected:].tolist())
    if len(selected) != expected or min(sizes[i] for i in selected) < pixels.shape[0] * pixels.shape[1] * .025:
        raise ValueError(f"Expected {expected} distinct, substantial artwork components; found {count} labels")

    slices = find_objects(labels)
    parts = []
    for index in selected:
        sy, sx = slices[index - 1]
        cropped = pixels[sy, sx].copy()
        cropped[:, :, 3] = np.where(labels[sy, sx] == index, cropped[:, :, 3], 0)
        parts.append((sx.start, sy.start, Image.fromarray(cropped, "RGBA")))
    parts.sort(key=lambda p: p[0])
    return parts


def prepare_three_pose(source):
    parts = extract_major_components(source, 3)
    cell_width = max(p.width for _, _, p in parts) + PADDING * 2
    cell_height = source.height + PADDING * 2
    clean = Image.new("RGBA", (cell_width * 3, cell_height), (0, 0, 0, 0))
    for frame, (_, top, part) in enumerate(parts):
        x = frame * cell_width + (cell_width - part.width) // 2
        clean.paste(part, (x, top + PADDING))
    return clean


def prepare_front(source):
    parts = extract_major_components(source, 1)
    _, _, part = parts[0]
    clean = Image.new("RGBA", (part.width + PADDING * 2, part.height + PADDING * 2), (0, 0, 0, 0))
    clean.paste(part, (PADDING, PADDING))
    return clean


def validate(sheet, frames):
    arr = np.asarray(sheet.getchannel("A"))
    width = sheet.width // frames
    assert width * frames == sheet.width
    for i in range(frames):
        frame = arr[:, i * width:(i + 1) * width]
        # Zero alpha on all four edges of every cell, including cropped turns.
        assert not frame[0, :].any(), "Top cut detected"
        assert not frame[-1, :].any(), "Bottom cut detected"
        assert not frame[:, :24].any(), "Left cut detected"
        assert not frame[:, -24:].any(), "Right cut detected"
        assert frame.any(), "Missing frame"


def run():
    CLEAN.mkdir(parents=True, exist_ok=True)
    WEBP.mkdir(parents=True, exist_ok=True)
    report = []
    files = sorted(SOURCE.glob("GAIA-JET-*.png"))
    assert len(files) == 21, f"Expected 21 original files, found {len(files)}"
    for path in files:
        with Image.open(path) as original:
            original = original.convert("RGBA")
            frames = 1 if "-01-front" in path.name else 3
            clean = prepare_front(original) if frames == 1 else prepare_three_pose(original)
        validate(clean, frames)

        png_file = CLEAN / path.name
        clean.save(png_file, "PNG", optimize=True)

        # Resize as complete cells: the new frame width remains exactly divisible by 3.
        target_h = 768 if frames == 1 else (640 if "ROYAL" in path.name else 608)
        ratio = target_h / clean.height
        cell_width = clean.width // frames
        scaled_cell_width = max(1, round(cell_width * ratio))
        scaled = clean.resize((scaled_cell_width * frames, target_h), Image.Resampling.LANCZOS)
        validate(scaled, frames)
        webp_file = WEBP / path.with_suffix(".webp").name
        scaled.save(webp_file, "WEBP", quality=93, method=6)
        report.append(f"{path.name}: {original.width}x{original.height} -> clean {clean.width}x{clean.height} -> game {scaled.width}x{scaled.height}")
    print("\n".join(report))
    print(f"Validated {len(report)} uncut sprites / {7 * 6} complete animated frames")


if __name__ == "__main__":
    run()
