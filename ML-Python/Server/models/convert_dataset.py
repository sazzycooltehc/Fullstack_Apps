import os
import cv2
import json
import argparse
import numpy as np
from tqdm import tqdm
from midv500.utils import (
    list_annotation_paths_recursively,
    get_bbox_inside_image,
    create_dir,
)


def convert(root_dir: str, export_dir: str, filename: str):
    """
    Walks inside root_dir (should only contain original MIDV-500 dataset folders),
    reads all annotations, and creates a COCO styled annotation file
    saved as <filename>_coco.json inside export_dir.

    Example:
        root_dir   : ~/data/midv500/
        export_dir : ~/data/
        filename   : midv500
    """

    # raise error if export_dir is given as a json file path
    if export_dir.endswith(".json"):
        raise ValueError("export_dir should be a directory, not a file path!")

    # create export_dir if not present
    create_dir(export_dir)

    # init coco vars
    images = []
    annotations = []

    annotation_paths = list_annotation_paths_recursively(root_dir)
    print(f"Converting {len(annotation_paths)} files to COCO...")

    for ind, rel_annotation_path in enumerate(tqdm(annotation_paths)):
        # get image path
        rel_image_path = rel_annotation_path.replace("ground_truth", "images")
        rel_image_path = rel_image_path.replace("json", "tif")

        # load image
        abs_image_path = os.path.join(root_dir, rel_image_path)
        image = cv2.imread(abs_image_path)
        if image is None:
            print(f"[WARN] Could not read image: {abs_image_path}")
            continue
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # prepare image info
        image_dict = {
            "file_name": rel_image_path,
            "height": image.shape[0],
            "width": image.shape[1],
            "id": ind,
        }
        images.append(image_dict)

        # full image bbox
        image_bbox = [0, 0, image.shape[1], image.shape[0]]

        # load mask coords
        abs_annotation_path = os.path.join(root_dir, rel_annotation_path)
        quad = json.load(open(abs_annotation_path, "r"))
        mask_coords = quad["quad"]

        # create mask from poly coords
        mask = np.zeros(image.shape, dtype=np.uint8)
        mask_coords_np = np.array(mask_coords, dtype=np.int32)
        cv2.fillPoly(mask, [mask_coords_np], color=(255, 255, 255))
        mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
        mask = cv2.threshold(mask, 0, 255, cv2.THRESH_BINARY)[1]

        # get bbox [minx, miny, maxx, maxy]
        label_xmin = min([pos[0] for pos in mask_coords])
        label_xmax = max([pos[0] for pos in mask_coords])
        label_ymin = min([pos[1] for pos in mask_coords])
        label_ymax = max([pos[1] for pos in mask_coords])
        label_bbox = [label_xmin, label_ymin, label_xmax, label_ymax]
        label_bbox = get_bbox_inside_image(label_bbox, image_bbox)

        # coco style bbox [x, y, w, h] + area
        label_area = int(
            (label_bbox[2] - label_bbox[0]) * (label_bbox[3] - label_bbox[1])
        )
        coco_bbox = [
            label_bbox[0],
            label_bbox[1],
            label_bbox[2] - label_bbox[0],
            label_bbox[3] - label_bbox[1],
        ]

        # prepare annotation info
        annotation_dict = {
            "iscrowd": 0,
            "image_id": image_dict["id"],
            "category_id": 1,  # id card
            "ignore": 0,
            "id": ind,
            "bbox": coco_bbox,
            "area": label_area,
            "segmentation": [
                [coord for pair in mask_coords for coord in pair]
            ],
        }
        annotations.append(annotation_dict)

    # combine lists
    coco_dict = {
        "images": images,
        "annotations": annotations,
        "categories": [{"name": "id_card", "id": 1}],
    }

    # export
    export_path = os.path.join(export_dir, filename + "_coco.json")
    with open(export_path, "w") as f:
        json.dump(coco_dict, f, indent=4)

    print(f"✅ COCO file saved to {export_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert MIDV-500 annotations to COCO format."
    )
    parser.add_argument(
        "root_dir", help="Directory of the downloaded MIDV-500 dataset."
    )
    parser.add_argument(
        "export_dir", help="Directory where the COCO file will be exported."
    )
    parser.add_argument(
        "--filename",
        default="midv500",
        help="Name of the COCO JSON file (without extension).",
    )
    args = parser.parse_args()

    convert(args.root_dir, args.export_dir, args.filename)
