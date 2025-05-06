# Loading 组件集合

加载组件集合为 Curio 应用提供了统一的加载状态显示方案。此套件提供了多种加载组件以适应不同的使用场景。

## 组件列表

### 1. LoadingSpinner

基础的加载动画组件，可用作其他加载组件的基础。

```jsx
import { LoadingSpinner } from '../../components/common/Loading';

<LoadingSpinner size="medium" color="#3C82F6" />
```

**属性**:
- `size`: 'small' | 'medium' | 'large'，默认为 'medium'
- `color`: 可选，加载动画颜色
- `className`: 可选，附加类名

### 2. FullPageLoading

全页面加载组件，适用于整个页面的加载状态。

```jsx
import { FullPageLoading } from '../../components/common/Loading';

<MainLayout>
  <FullPageLoading message="Loading survey data..." />
</MainLayout>
```

**属性**:
- `message`: 可选，加载提示文本，默认为 'Loading...'
- `spinnerSize`: 可选，加载动画尺寸，默认为 'medium'
- `spinnerColor`: 可选，加载动画颜色
- `className`: 可选，附加类名

### 3. LoadingOverlay

加载覆盖层组件，用于覆盖在内容上方显示加载状态。

```jsx
import { LoadingOverlay } from '../../components/common/Loading';

<div style={{ position: 'relative' }}>
  <div>内容区域</div>
  {isLoading && <LoadingOverlay message="Processing..." />}
</div>
```

**属性**:
- `isVisible`: 可选，是否显示覆盖层，默认为 true
- `message`: 可选，加载提示文本，默认为 'Processing...'
- `spinnerSize`: 可选，加载动画尺寸，默认为 'medium'
- `spinnerColor`: 可选，加载动画颜色
- `className`: 可选，附加类名

### 4. LoadingIndicator

局部加载指示器组件，用于显示某个元素或操作的加载状态。

```jsx
import { LoadingIndicator } from '../../components/common/Loading';

<div>
  <span>提交中</span>
  <LoadingIndicator text="Saving..." />
</div>
```

**属性**:
- `isLoading`: 可选，是否显示加载状态，默认为 true
- `text`: 可选，加载提示文本，默认为 'Loading...'
- `showText`: 可选，是否显示文本，默认为 true
- `className`: 可选，附加类名

### 5. InlineLoading

内联加载组件，用于行内显示加载状态。

```jsx
import { InlineLoading } from '../../components/common/Loading';

<button disabled>
  <InlineLoading text="Processing..." />
</button>
```

**属性**:
- `text`: 可选，加载提示文本，默认为 'Loading...'
- `showText`: 可选，是否显示文本，默认为 true
- `className`: 可选，附加类名

## 项目中的使用场景

### 页面级使用场景

以下是各个Loading组件在Curio项目不同页面中的实际应用场景：

#### 1. SurveyPreview 页面

- **FullPageLoading**: 用于问卷数据初始加载
  ```jsx
  if (isLoading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey data..." />
      </MainLayout>
    );
  }
  ```

#### 2. NewSurvey 页面

- **FullPageLoading**: 用于编辑模式下问卷数据的初始加载
  ```jsx
  if (isLoading && isEditing) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey data..." />
      </MainLayout>
    );
  }
  ```

- **LoadingOverlay**: 用于异步操作过程中的全局遮罩
  ```jsx
  {isLoading && (
    <LoadingOverlay message="Processing..." />
  )}
  ```

- **LoadingIndicator**: 用于问题保存时的局部加载指示
  ```jsx
  <span className="question-number">Question {question.number}</span>
  {question.isSubmitting && (
    <LoadingIndicator text="Saving..." />
  )}
  ```

#### 3. SurveyPublished 页面

- **FullPageLoading**: 用于问卷发布数据的初始加载
  ```jsx
  if (isLoading) {
    return (
      <MainLayout>
        <FullPageLoading message="Loading survey data..." />
      </MainLayout>
    );
  }
  ```

#### 4. SurveyCard 组件

- **InlineLoading**: 用于卡片操作按钮的加载状态
  ```jsx
  <Button 
    variant="secondary" 
    icon={<ViewIcon />} 
    onClick={handleView}
    disabled={isLoading}
  >
    {isLoading ? <InlineLoading text="Opening..." showText={true} /> : 'View'}
  </Button>
  ```

- **LoadingIndicator**: 用于删除确认时的加载状态
  ```jsx
  <div className="delete-confirm">
    <span>Sure to delete?</span>
    <button onClick={handleCancelDelete} disabled={isLoading}>Cancel</button>
    <button onClick={handleDeleteClick} disabled={isLoading}>
      {isLoading ? <LoadingIndicator text="Deleting..." /> : 'Confirm'}
    </button>
  </div>
  ```

#### 5. SurveyChatPage 页面

- **LoadingOverlay**: 用于聊天初始化和加载历史记录
  ```jsx
  {loading && (
    <LoadingOverlay message="Initializing chat..." />
  )}
  ```

- **LoadingIndicator**: 用于消息发送中状态
  ```jsx
  <button 
    className="chat-send-button" 
    onClick={handleSendMessage} 
    disabled={!inputValue.trim() || isLoading}
  >
    {isLoading ? (
      <LoadingIndicator text="" showText={false} />
    ) : (
      <img src={sendIcon} alt="Send" />
    )}
  </button>
  ```

### 待实现使用场景

以下组件使用场景还未完全实现，但适用于以下场景：

- **LoadingSpinner**: 可用于自定义加载场景
  ```jsx
  <div className="custom-loading">
    <LoadingSpinner size="small" color="#FF5722" />
    <span>自定义加载内容</span>
  </div>
  ```

### 组件适用场景总结

各组件最适合的使用场景：

| 组件名称 | 适用场景 | 已应用页面 |
|---------|---------|------------|
| FullPageLoading | 页面初始加载、无数据时的加载状态 | SurveyPreview, NewSurvey, SurveyPublished |
| LoadingOverlay | 异步操作中的内容遮罩、表单提交中 | NewSurvey, SurveyChatPage |
| LoadingIndicator | 列表项加载、局部操作的状态指示 | NewSurvey (问题提交), SurveyChatPage (消息发送) |
| InlineLoading | 按钮内加载状态、行内加载提示 | SurveyCard (按钮加载) |
| LoadingSpinner | 自定义加载场景的基础组件 | 作为基础组件使用 |

## 使用示例

### 页面加载

```jsx
if (isLoading) {
  return (
    <MainLayout>
      <FullPageLoading message="Loading survey data..." />
    </MainLayout>
  );
}
```

### 提交数据时的覆盖加载

```jsx
<div className="form-container">
  <form>
    {/* 表单内容 */}
  </form>
  
  {isSubmitting && <LoadingOverlay message="Submitting..." />}
</div>
```

### 提交按钮的加载状态

```jsx
<Button 
  variant="primary" 
  disabled={isSubmitting}
>
  {isSubmitting ? <InlineLoading text="Saving..." /> : "Save"}
</Button>
```

### 局部操作的加载指示

```jsx
<div className="item-row">
  <span className="item-name">项目名称</span>
  {isUpdating && <LoadingIndicator text="Updating..." />}
</div>
```

## 设计原则

1. **一致性**: 所有加载状态使用统一的样式和动画
2. **响应性**: 组件适应不同屏幕尺寸
3. **可配置**: 提供合理的默认值，同时允许自定义
4. **无侵入性**: 加载组件不会影响页面结构
5. **可访问性**: 考虑到屏幕阅读器等辅助技术 