/**
 * Loading组件集合的入口文件
 * 2024-08-22T16:45:00Z 创建：统一导出所有Loading相关组件
 */

import LoadingSpinner from './LoadingSpinner';
import FullPageLoading from './FullPageLoading';
import LoadingOverlay from './LoadingOverlay';
import LoadingIndicator from './LoadingIndicator';
import InlineLoading from './InlineLoading';

export {
  LoadingSpinner,
  FullPageLoading,
  LoadingOverlay,
  LoadingIndicator,
  InlineLoading
};

// 默认导出主要使用的组件
export default FullPageLoading; 