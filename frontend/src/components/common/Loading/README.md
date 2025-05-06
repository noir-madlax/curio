# Loading组件统一迁移计划

## 已完成事项

1. 创建了统一的Loading组件集合：
   - `LoadingSpinner`: 基础加载动画组件
   - `FullPageLoading`: 全页面加载组件
   - `LoadingOverlay`: 加载覆盖层组件
   - `LoadingIndicator`: 局部加载指示器组件
   - `InlineLoading`: 内联加载组件

2. 已将以下JSX文件中的旧loading实现替换为新组件：
   - `/pages/SurveyPreview/SurveyPreview.jsx`
   - `/pages/NewSurvey/NewSurvey.jsx`
   - `/pages/SurveyPublished/SurveyPublished.jsx`
   - `/pages/SurveyResponse/SurveyResponse.jsx`
   - `/pages/SurveyResult/SurveyResult.jsx`
   - `/pages/Survey/Survey.jsx`
   - `/pages/SurveyRespondent/SurveyChatPage.jsx`

## 待完成事项

1. 清理旧的CSS样式定义，以下文件中仍包含旧loading样式：
   - `/pages/NewSurvey/NewSurvey.css`
   - `/pages/SurveyPublished/SurveyPublished.css`
   - `/pages/SurveyPreview/SurveyPreview.css`
   - `/pages/SurveyResponse/SurveyResponse.css`
   - `/pages/SurveyResult/SurveyResult.css`

2. 删除以下样式类：
   - `.loading-spinner`
   - `.loading-container`
   - `.loading-overlay`
   - `.loading-message`
   - 相关的动画定义如`@keyframes spin`

3. 更新其他潜在使用旧样式的组件：
   - 检查`/components/auth/LoginModal.jsx`
   - 检查`/components/layout/Sidebar/UserProfile.jsx`
   - 检查`/context/AuthContext.jsx`

## 使用指南

### 加载状态

加载状态是用户体验的重要部分，统一的加载组件可以确保整个应用的一致性。根据不同场景选择适当的Loading组件：

1. **整页面加载**：使用`FullPageLoading`
   ```jsx
   import { FullPageLoading } from '../../components/common/Loading';
   
   if (isLoading) {
     return (
       <MainLayout>
         <FullPageLoading message="Loading data..." />
       </MainLayout>
     );
   }
   ```

2. **覆盖层加载**：使用`LoadingOverlay`
   ```jsx
   import { LoadingOverlay } from '../../components/common/Loading';
   
   <div className="container">
     {/* 内容 */}
     {isSubmitting && <LoadingOverlay message="Submitting..." />}
   </div>
   ```

3. **局部加载**：使用`LoadingIndicator`
   ```jsx
   import { LoadingIndicator } from '../../components/common/Loading';
   
   <div>
     <span>Status: </span>
     {isLoading && <LoadingIndicator text="Loading..." />}
   </div>
   ```

4. **内联加载**：使用`InlineLoading`
   ```jsx
   import { InlineLoading } from '../../components/common/Loading';
   
   <button disabled={isSubmitting}>
     {isSubmitting ? <InlineLoading text="Saving..." /> : "Save"}
   </button>
   ```

5. **自定义加载**：使用基础的`LoadingSpinner`
   ```jsx
   import { LoadingSpinner } from '../../components/common/Loading';
   
   <div className="custom-container">
     <LoadingSpinner size="small" color="#FF5722" />
     <p>自定义加载文本</p>
   </div>
   ```

### CSS注意事项

使用新的Loading组件后，不需要在各组件的CSS文件中定义loading相关的样式，所有样式已统一到`/components/common/Loading/Loading.css`中。 