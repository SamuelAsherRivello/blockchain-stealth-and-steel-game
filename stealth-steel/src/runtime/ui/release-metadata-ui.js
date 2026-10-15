export function formatReleaseMetadataText({ releaseVersion, downloadSize }, { showFilesizeInHud = true } = {}) {
  return showFilesizeInHud && downloadSize ? `${releaseVersion} ${downloadSize}` : releaseVersion;
}

export function createReleaseMetadataUi({
  host,
  metadata,
  showFilesizeInHud = true,
  documentRef = globalThis.document,
}) {
  const element = documentRef.createElement("p");
  element.className = "release-metadata";
  element.textContent = formatReleaseMetadataText(metadata, { showFilesizeInHud });
  host.append(element);
  return element;
}
