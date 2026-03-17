import type { GlobalConfig } from 'payload'

export const AutomationSettings: GlobalConfig = {
  slug: 'automation-settings',
  label: 'Automation Controls',
  admin: {
    description: 'Pause or resume any automated function. Changes take effect on the next scheduled run.',
    group: 'Settings',
  },
  fields: [
    {
      type: 'ui',
      name: 'statusNote',
      admin: {
        components: {
          Field: '/src/components/admin/AutomationStatusBanner#AutomationStatusBanner',
        },
      },
    },
    {
      name: 'researchProvider',
      type: 'select',
      label: 'Research Provider',
      defaultValue: 'claude',
      admin: {
        description: 'Which AI provider to use for web search (news scanning, fact-checking, re-prioritization). Claude requires no extra API key.',
      },
      options: [
        { label: 'Claude Web Search — no extra API key needed', value: 'claude' },
        { label: 'Gemini — requires GEMINI_API_KEY', value: 'gemini' },
      ],
    },
    {
      type: 'collapsible',
      label: '📡 News Scanner (Cron A — every 3 hours)',
      fields: [
        {
          name: 'scanNewsEnabled',
          label: 'Enable news scanning',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Scans Canadian biz/tech news and creates article suggestions.',
          },
        },
        {
          name: 'rePrioritizeEnabled',
          label: 'Enable re-prioritization of existing suggestions',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'During each scan, re-scores existing pending/approved suggestions as stories develop.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '✍️ Autonomous Writer (Cron B — Mon/Wed/Fri)',
      fields: [
        {
          name: 'autoWriteEnabled',
          label: 'Enable autonomous article writing',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Claude picks from approved suggestions, fact-checks with Gemini, writes and publishes articles automatically.',
          },
        },
        {
          name: 'autoPublishEnabled',
          label: 'Auto-publish (uncheck to land as draft instead)',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'When enabled, articles go live immediately. Disable to have Claude write drafts for your review instead.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '🔄 Article Updater — Recent Posts (Cron D — weekly)',
      fields: [
        {
          name: 'weeklyUpdateEnabled',
          label: 'Enable weekly updates for recent posts',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Checks posts from the last 3 months for new developments and appends update blocks.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: '🔍 Quality Audit + Older Post Updates (Cron C — monthly)',
      fields: [
        {
          name: 'qualityAuditEnabled',
          label: 'Enable monthly quality audit',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Claude reviews all published posts for AI slop and incoherence, scoring and flagging them.',
          },
        },
        {
          name: 'monthlyUpdateEnabled',
          label: 'Enable monthly updates for older posts',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'During the monthly audit, also check posts older than 3 months for new developments.',
          },
        },
      ],
    },
  ],
}
