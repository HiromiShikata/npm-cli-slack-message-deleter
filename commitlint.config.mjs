import conventionalCommits from 'conventional-changelog-conventionalcommits';

export default {
  parserPreset: {
    parserOpts: conventionalCommits(),
  },
  rules: {
    'body-max-line-length': [2, 'always', 'Infinity'],
  },
};
