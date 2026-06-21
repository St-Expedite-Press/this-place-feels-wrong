"""Build a seamless breathing loop from the two Void Engine source stills."""

from __future__ import annotations

import argparse
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageFilter


def load_rgb(path: Path) -> np.ndarray:
    image = Image.open(path).convert("RGB")
    # Crop the abstract texture to a web-native 16:9 frame. Keeping the source
    # centered preserves the violet field and avoids browser scaling seams.
    target_ratio = 16 / 9
    source_ratio = image.width / image.height
    if source_ratio < target_ratio:
        crop_height = round(image.width / target_ratio)
        top = (image.height - crop_height) // 2
        image = image.crop((0, top, image.width, top + crop_height))
    elif source_ratio > target_ratio:
        crop_width = round(image.height * target_ratio)
        left = (image.width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, image.height))
    image = image.resize((1280, 720), Image.Resampling.LANCZOS)
    return np.asarray(image, dtype=np.float32) / 255.0


def blurred_mask(mask: np.ndarray, radius: float) -> np.ndarray:
    image = Image.fromarray(np.uint8(np.clip(mask, 0, 1) * 255), mode="L")
    image = image.filter(ImageFilter.GaussianBlur(radius=radius))
    return np.asarray(image, dtype=np.float32) / 255.0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--light", type=Path, required=True)
    parser.add_argument("--dark", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--seconds", type=float, default=16.0)
    parser.add_argument("--fps", type=int, default=24)
    args = parser.parse_args()

    light = load_rgb(args.light)
    dark = load_rgb(args.dark)
    if light.shape != dark.shape:
        raise ValueError(f"Source dimensions differ: {light.shape} vs {dark.shape}")

    height, width, _ = light.shape
    rng = np.random.default_rng(2909511)

    reference = np.maximum(light, dark)
    green = reference[:, :, 1]
    red = reference[:, :, 0]
    blue = reference[:, :, 2]

    green_points = (
        (green > 0.15)
        & (green > red * 1.16)
        & (green > blue * 1.05)
    ).astype(np.float32)

    # Divide reflective points into independent timing groups.
    phase_noise = rng.random((height, width))
    twinkle_groups = []
    for group in range(4):
        selected = green_points * (
            (phase_noise >= group / 4) & (phase_noise < (group + 1) / 4)
        )
        twinkle_groups.append(blurred_mask(selected, 0.65))

    # A broad, dim red-violet glow confined to the central colored pavement.
    red_violet = (
        np.clip(red - green * 0.72, 0, 1)
        + np.clip(blue - green * 0.78, 0, 1) * 0.32
    )
    center_glow = blurred_mask(np.clip(red_violet * 2.4, 0, 1), 7.0)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    total_frames = round(args.seconds * args.fps)

    with imageio.get_writer(
        args.output,
        fps=args.fps,
        codec="libx264",
        quality=8,
        macro_block_size=2,
        ffmpeg_params=[
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            "-crf",
            "18",
            "-preset",
            "slow",
        ],
    ) as writer:
        for frame_number in range(total_frames):
            phase = frame_number / total_frames

            # A slow, shallow breath: never travel all the way to the heavily
            # graded still. This keeps the page spacious instead of pulsing.
            breath = 0.5 - 0.5 * np.cos(phase * np.pi * 2)
            dark_mix = breath * 0.24
            frame = light * (1.0 - dark_mix) + dark * dark_mix

            # Independent, crisp twinkling at varied tempos and phases.
            twinkle = np.zeros((height, width), dtype=np.float32)
            for group, mask in enumerate(twinkle_groups):
                # Integer cycle counts guarantee continuity at the loop seam.
                frequency = (2, 3, 5, 7)[group]
                offset = group * 1.73
                signal = np.sin(phase * np.pi * 2 * frequency + offset)
                signal = np.maximum(signal, 0) ** 7
                twinkle += mask * signal

            frame[:, :, 1] += twinkle * 0.095
            frame[:, :, 2] += twinkle * 0.022

            # Red-violet glow expands with the slower breathing cycle.
            glow = center_glow * (0.008 + 0.025 * breath)
            frame[:, :, 0] += glow
            frame[:, :, 2] += glow * 0.42

            writer.append_data(np.uint8(np.clip(frame, 0, 1) * 255))

    print(args.output.resolve())


if __name__ == "__main__":
    main()
