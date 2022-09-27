// 此处不要导入 @/i18n 使用 i18n.global ，因为我们在 router 中 layout 不是按需加载，所以会在 Guide 会在 I18n 初始化完成之前被直接调用。导致 i18n 为 undefined
const steps = (i18n) => {
  return [
    {
      element: '#guide-start',
      popover: {
        title: i18n.t('guide.guideTitle'),
        description: i18n.t('guide.guideDesc'),
        position: 'bottom-right'
      }
    },
    {
      element: '#guide-search',
      popover: {
        title: i18n.t('guide.searchTitle'),
        description: i18n.t('guide.searchDesc'),
        position: 'bottom-right'
      }
    },
    {
      element: '#guide-lang',
      popover: {
        title: i18n.t('guide.langTitle'),
        description: i18n.t('guide.langDesc'),
        position: 'bottom-right'
      }
    },
    {
      element: '#guide-full',
      popover: {
        title: i18n.t('guide.fullTitle'),
        description: i18n.t('guide.fullDesc'),
        position: 'bottom-right'
      }
    },
    {
      element: '#guide-theme',
      popover: {
        title: i18n.t('guide.themeTitle'),
        description: i18n.t('guide.themeDesc'),
        position: 'bottom-right'
      }
    },
    {
      element: '#fold-sidebar',
      popover: {
        title: i18n.t('guide.hamburgerTitle'),
        description: i18n.t('guide.hamburgerDesc')
      }
    },
    {
      element: '#guide-breadcrumb',
      popover: {
        title: i18n.t('guide.breadcrumbTitle'),
        description: i18n.t('guide.breadcrumbDesc')
      }
    },

    {
      element: '#guide-tags',
      popover: {
        title: i18n.t('guide.tagTitle'),
        description: i18n.t('guide.tagDesc')
      }
    },
    {
      element: '#guide-sidebar',
      popover: {
        title: i18n.t('guide.sidebarTitle'),
        description: i18n.t('guide.sidebarDesc'),
        position: 'right-center'
      }
    }
  ]
}
export default steps
