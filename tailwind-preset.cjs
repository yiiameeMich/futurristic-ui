/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'fu-primary':       'var(--fu-primary)',
        'fu-primary-light': 'var(--fu-primary-light)',
        'fu-primary-dark':  'var(--fu-primary-dark)',
        'fu-secondary':     'var(--fu-secondary)',
        'fu-accent':        'var(--fu-accent)',
        'fu-surface':       'var(--fu-surface)',
        'fu-surface-raised':'var(--fu-surface-raised)',
        'fu-on-surface':    'var(--fu-on-surface)',
        'fu-on-primary':    'var(--fu-on-primary)',
        'fu-border':        'var(--fu-border)',
        'fu-success':       'var(--fu-success)',
        'fu-warning':       'var(--fu-warning)',
        'fu-danger':        'var(--fu-danger)',
      },
      borderRadius: {
        fu:    'var(--fu-radius)',
        'fu-lg': 'var(--fu-radius-lg)',
      },
    },
  },
}
