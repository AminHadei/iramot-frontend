const changelogFunctions = {
  getReleaseLine(changeset) {
    const [firstLine, ...futureLines] = changeset.summary
      .split("\n")
      .map((line) => line.trimEnd());
    let entry = `- ${firstLine}`;
    if (futureLines.length > 0) {
      entry += `\n${futureLines.map((line) => `  ${line}`).join("\n")}`;
    }
    return entry;
  },
  getDependencyReleaseLine(_changesets, dependenciesUpdated) {
    if (dependenciesUpdated.length === 0) return "";
    const lines = dependenciesUpdated.map(
      (dependency) => `  - ${dependency.name}@${dependency.newVersion}`,
    );
    return ["- Updated dependencies", ...lines].join("\n");
  },
};

export default changelogFunctions;
