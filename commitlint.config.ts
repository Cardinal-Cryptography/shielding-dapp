import type { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';

export default {
  plugins: [
    {
      rules: {
        'header-match-regex': (parsed, when, regExp: unknown) => {
          const isRegExp = (v: unknown): v is RegExp => v instanceof RegExp;
          if (!isRegExp(regExp)) throw new Error('Missing regExp.');

          const { header } = parsed;
          const matched = (header ?? '').match(new RegExp(regExp, 'g')) != null;

          return [
            matched,
            `commit message does not match the pattern: "${regExp.toString()}"`,
          ];
        },
      },
    },
  ],
  rules: {
    'header-match-regex': [RuleConfigSeverity.Error, 'always', /^[A-Z0-9]+-\d+: [^a-z].*/],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
    'header-full-stop': [RuleConfigSeverity.Error, 'never', '.'],
    'body-full-stop': [RuleConfigSeverity.Error, 'always', '.'],
    'body-case': [RuleConfigSeverity.Error, 'always', 'sentence-case'],
    'body-leading-blank': [RuleConfigSeverity.Error, 'always'],
  },
  helpUrl: 'README.md',
} satisfies UserConfig;
