module.exports = {
  extends: ["@lucaspickering/eslint-config/react"],
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        // Prefer our useDrag/useDrop wrappers over the stock ones
        selector:
          "ImportDeclaration[source.value=react-dnd] > ImportSpecifier[imported.name=/useDrag|useDrop|useDragLayer/]",
        message:
          "Use the local useDrag/useDrop wrapper instead of the one from react-dnd",
      },
      {
        selector:
          "ImportDeclaration[source.value=react-relay] > ImportSpecifier[imported.name=useMutation]",
        message:
          "Use the local useMutation wrapper instead of the one from react-relay",
      },
    ],
  },
};
