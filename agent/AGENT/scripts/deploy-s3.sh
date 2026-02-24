#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
. "$SCRIPT_DIR/common.sh"
require_cmd aws

PROJECT_DIR=$(project_dir_from_arg "$@")
DIST_DIR=$(resolve_dist_dir "$PROJECT_DIR")
S3_BUCKET=${S3_BUCKET:-}

[ -d "$DIST_DIR" ] || fail "Dist directory not found: $DIST_DIR. Run build first."
[ -n "$S3_BUCKET" ] || fail "Set S3_BUCKET for S3 deploy"

aws s3 sync "$DIST_DIR/" "s3://$S3_BUCKET/" --delete
