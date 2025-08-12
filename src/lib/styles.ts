/**
 * Tailwind CSS Classes Helper
 * 复用的样式类常量，确保整个应用的样式一致性
 * 
 * 使用方式：
 * import { styles } from '@/lib/styles';
 * <div className={styles.tooltipContainer}>...</div>
 */

// 基础组件样式
export const styles = {
  // 容器类
  tooltipContainer: 'fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm',
  panelContainer: 'bg-white rounded-lg shadow-sm border border-gray-200',
  overlayContainer: 'fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center',
  
  // 按钮样式
  btnPrimary: 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed',
  btnSecondary: 'px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200',
  btnSuccess: 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200',
  btnDanger: 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200',
  btnOutline: 'px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200',
  
  // 小型按钮
  btnSmall: 'px-3 py-1 text-sm rounded',
  btnIcon: 'p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200',
  
  // 输入框样式
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  textarea: 'w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  select: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white',
  
  // 阴影效果
  shadowSm: 'shadow-sm',
  shadowMd: 'shadow-md',
  shadowLg: 'shadow-lg',
  shadowXl: 'shadow-xl',
  panelShadow: 'shadow-lg border border-gray-200',
  
  // 文本样式
  textPrimary: 'text-gray-900',
  textSecondary: 'text-gray-600',
  textMuted: 'text-gray-500',
  textError: 'text-red-600',
  textSuccess: 'text-green-600',
  textWarning: 'text-yellow-600',
  
  // 标题样式
  heading1: 'text-2xl font-bold text-gray-900',
  heading2: 'text-xl font-semibold text-gray-900',
  heading3: 'text-lg font-medium text-gray-900',
  heading4: 'text-base font-medium text-gray-900',
  
  // 加载动画
  spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
  spinnerSm: 'w-4 h-4',
  spinnerMd: 'w-6 h-6',
  spinnerLg: 'w-8 h-8',
  
  // 状态指示器
  statusOnline: 'w-2 h-2 bg-green-500 rounded-full',
  statusOffline: 'w-2 h-2 bg-red-500 rounded-full',
  statusLoading: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse',
  
  // 卡片样式
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  cardHeader: 'border-b border-gray-200 pb-4 mb-4',
  cardBody: 'space-y-4',
  cardFooter: 'border-t border-gray-200 pt-4 mt-4',
  
  // 列表样式
  list: 'space-y-2',
  listItem: 'p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors duration-200',
  listItemActive: 'p-3 border border-blue-300 bg-blue-50 rounded-md',
  
  // 徽章样式
  badge: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  badgePrimary: 'bg-blue-100 text-blue-800',
  badgeSecondary: 'bg-gray-100 text-gray-800',
  badgeSuccess: 'bg-green-100 text-green-800',
  badgeDanger: 'bg-red-100 text-red-800',
  badgeWarning: 'bg-yellow-100 text-yellow-800',
  
  // 分隔线
  divider: 'border-t border-gray-200',
  dividerVertical: 'border-l border-gray-200',
  
  // 间距
  spacingXs: 'space-y-1',
  spacingSm: 'space-y-2',
  spacingMd: 'space-y-4',
  spacingLg: 'space-y-6',
  spacingXl: 'space-y-8',
  
  // 网格布局
  grid: 'grid gap-4',
  gridCols1: 'grid-cols-1',
  gridCols2: 'grid-cols-2',
  gridCols3: 'grid-cols-3',
  gridCols4: 'grid-cols-4',
  
  // Flex 布局
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexCol: 'flex flex-col',
  flexWrap: 'flex flex-wrap',
  
  // 过渡动画
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
  
  // 响应式隐藏/显示
  hiddenMobile: 'hidden md:block',
  hiddenDesktop: 'block md:hidden',
  
  // 滚动条样式
  scrollbar: 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
  
  // 特殊效果
  glassmorphism: 'backdrop-blur-sm bg-white/80 border border-white/20',
  gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
  
  // 无障碍相关
  srOnly: 'sr-only',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  
  // 翻译特定样式
  translationBubble: 'fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm p-4 transform transition-all duration-200 ease-out',
  translationResult: 'p-3 bg-gray-50 rounded-md border border-gray-200',
  originalText: 'text-gray-800 text-sm leading-relaxed',
  translatedText: 'text-gray-900 font-medium leading-relaxed',
  
  // 语言标签
  languageTag: 'inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded',
  
  // 置信度指示器
  confidenceHigh: 'text-green-600',
  confidenceMedium: 'text-yellow-600',
  confidenceLow: 'text-red-600',
  
  // 快捷键提示
  kbd: 'inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded border border-gray-300',
  
  // 错误状态
  errorContainer: 'p-4 bg-red-50 border border-red-200 rounded-md',
  errorText: 'text-red-800 text-sm',
  errorIcon: 'text-red-500',
  
  // 成功状态
  successContainer: 'p-4 bg-green-50 border border-green-200 rounded-md',
  successText: 'text-green-800 text-sm',
  successIcon: 'text-green-500',
  
  // 警告状态
  warningContainer: 'p-4 bg-yellow-50 border border-yellow-200 rounded-md',
  warningText: 'text-yellow-800 text-sm',
  warningIcon: 'text-yellow-500',
  
  // 信息状态
  infoContainer: 'p-4 bg-blue-50 border border-blue-200 rounded-md',
  infoText: 'text-blue-800 text-sm',
  infoIcon: 'text-blue-500',
} as const;

// 主题相关样式
export const themes = {
  light: {
    background: 'bg-white',
    surface: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    surface: 'bg-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700',
  },
} as const;

// 动画类
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  slideLeft: 'animate-slide-left',
  slideRight: 'animate-slide-right',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
} as const;

// 响应式断点
export const breakpoints = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
  '2xl': '2xl:',
} as const;

// 工具函数：组合类名
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// 工具函数：条件类名
export const clsx = (
  base: string,
  conditions: Record<string, boolean | undefined>
): string => {
  const conditionalClasses = Object.entries(conditions)
    .filter(([, condition]) => condition)
    .map(([className]) => className);
  
  return cn(base, ...conditionalClasses);
};

export default styles;