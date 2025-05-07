import React from 'react';
import './QuestionOptions.css';

// 问题类型常量
const QUESTION_TYPES = {
  TEXT: 'text',
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  NPS: 'rating_scale',
  BOOLEAN: 'yes_no',
};

// 问题类型名称
const QUESTION_TYPE_NAMES = {
  [QUESTION_TYPES.TEXT]: 'Text Question',
  [QUESTION_TYPES.SINGLE_CHOICE]: 'Single Choice',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPES.NPS]: 'NPS Rating',
  [QUESTION_TYPES.BOOLEAN]: 'Boolean Question',
};

/**
 * 通用问题选项显示组件
 * 2024-05-09: 创建通用组件统一问题选项的显示样式
 * 2024-10-14: 统一单选和多选的选中样式，保持形状差异
 * @param {Object} question - 问题对象
 * @param {string} mode - 显示模式: 'preview', 'respond', 'edit', 'view'
 * @param {*} currentAnswer - 当前问题的回答值
 * @param {Function} handleAnswerChange - 回答变更处理函数
 * @returns 
 */
const QuestionOptions = ({ 
  question, 
  mode = 'preview', 
  currentAnswer = null, 
  handleAnswerChange = () => {} 
}) => {
  const isInteractive = mode === 'respond';
  const isEditView = mode === 'edit' || mode === 'view';
  
  // 如果没有问题，返回null
  if (!question) return null;
  
  switch (question.type) {
    case QUESTION_TYPES.SINGLE_CHOICE:
      return (
        <div className="question-options-display">
          {isEditView ? (
            // 编辑/查看模式下的单选题显示
            <div className="options-list-preview">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, index) => (
                  <div key={option.id || index} className="option-preview-item">
                    <span className="option-number">{index + 1}.</span>
                    {option.text}
                  </div>
                ))
              ) : (
                <div className="no-options-message">No options available</div>
              )}
            </div>
          ) : (
            // 预览/回答模式下的单选题显示
            <div className="single-choice-container">
              {question.options?.map((option) => (
                <div 
                  key={option.id}
                  className={`single-choice-option ${currentAnswer === option.id ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isInteractive) handleAnswerChange(question.id, option.id);
                  }}
                >
                  <div className="option-radio">
                    <div className={`radio-outer ${currentAnswer === option.id ? 'selected' : ''}`}>
                      {currentAnswer === option.id && <div className="radio-inner"></div>}
                    </div>
                  </div>
                  <span className="option-text">{option.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
      
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
      
      return (
        <div className="question-options-display">
          {isEditView ? (
            // 编辑/查看模式下的多选题显示
            <div className="options-list-preview">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, index) => (
                  <div key={option.id || index} className="option-preview-item">
                    <span className="option-number">{index + 1}.</span>
                    {option.text}
                  </div>
                ))
              ) : (
                <div className="no-options-message">No options available</div>
              )}
            </div>
          ) : (
            // 预览/回答模式下的多选题显示
            <div className="multiple-choice-container">
              {question.options?.map((option) => (
                <div 
                  key={option.id}
                  className={`multiple-choice-option ${selectedOptions.includes(option.id) ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isInteractive) {
                      const newSelection = selectedOptions.includes(option.id)
                        ? selectedOptions.filter(id => id !== option.id)
                        : [...selectedOptions, option.id];
                      handleAnswerChange(question.id, newSelection);
                    }
                  }}
                >
                  <div className="option-radio">
                    <div className={`radio-outer ${selectedOptions.includes(option.id) ? 'selected' : ''}`}>
                      {selectedOptions.includes(option.id) && <div className="radio-inner"></div>}
                    </div>
                  </div>
                  <span className="option-text">{option.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
      
    case QUESTION_TYPES.NPS:
      return (
        <div className="question-options-display">
          {isEditView ? (
            // 编辑/查看模式下的NPS题显示
            <div className="nps-preview">
              <div className="nps-scale-preview">
                {Array.from({length: 11}, (_, i) => (
                  <div key={i} className="nps-number">{i}</div>
                ))}
              </div>
              {question.options && question.options.length >= 2 && (
                <div className="nps-labels-preview">
                  <div className="nps-label-item">
                    <span>0:</span> {question.options.find(o => o.order === 1)?.text || 'Not likely'}
                  </div>
                  <div className="nps-label-item">
                    <span>10:</span> {question.options.find(o => o.order === 2)?.text || 'Extremely likely'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 预览/回答模式下的NPS题显示
            <div className="nps-container">
              <div className="nps-scale">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <div 
                    key={value}
                    className={`nps-option ${currentAnswer === value ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                    onClick={() => {
                      if (isInteractive) handleAnswerChange(question.id, value);
                    }}
                  >
                    {value}
                  </div>
                ))}
              </div>
              <div className="nps-labels">
                <span>
                  {question.options && question.options.length > 0 
                    ? question.options.find(o => o.order === 1)?.text 
                    : 'Not likely at all'}
                </span>
                <span>
                  {question.options && question.options.length > 0 
                    ? question.options.find(o => o.order === 2)?.text 
                    : 'Extremely likely'}
                </span>
              </div>
            </div>
          )}
        </div>
      );
      
    case QUESTION_TYPES.BOOLEAN:
      // 2024-10-14: 增加调试代码，确保布尔值类型正确
      const isYesSelected = currentAnswer === true;
      const isNoSelected = currentAnswer === false;
      
      // 调试日志
      if (isInteractive) {
        console.log('布尔题状态:', {
          questionId: question.id,
          currentAnswer: currentAnswer,
          type: typeof currentAnswer,
          isYesSelected,
          isNoSelected
        });
      }
      
      return (
        <div className="question-options-display">
          {isEditView ? (
            // 编辑/查看模式下的布尔题显示
            <div className="boolean-preview">
              <div className="boolean-options-preview">
                {question.options && question.options.length >= 2 ? (
                  <span>
                    {question.options.find(o => o.order === 1)?.text || 'Yes'} / {question.options.find(o => o.order === 2)?.text || 'No'}
                  </span>
                ) : (
                  <span>Yes / No</span>
                )}
              </div>
            </div>
          ) : (
            // 预览/回答模式下的布尔题显示
            <div className="boolean-container">
              <div className="boolean-options">
                <div 
                  className={`boolean-option ${isYesSelected ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isInteractive) {
                      console.log('点击Yes选项');
                      handleAnswerChange(question.id, true);
                    }
                  }}
                >
                  {question.options && question.options.length > 0 ? question.options[0]?.text : 'Yes'}
                </div>
                <div 
                  className={`boolean-option ${isNoSelected ? 'selected' : ''} ${!isInteractive ? 'disabled' : ''}`}
                  onClick={() => {
                    if (isInteractive) {
                      console.log('点击No选项');
                      handleAnswerChange(question.id, false);
                    }
                  }}
                >
                  {question.options && question.options.length > 1 ? question.options[1]?.text : 'No'}
                </div>
              </div>
            </div>
          )}
        </div>
      );
      
    case QUESTION_TYPES.TEXT:
      return (
        <div className="question-options-display">
          <div className="text-container">
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => isInteractive && handleAnswerChange(question.id, e.target.value)}
              className="text-input"
              placeholder="Enter your answer here..."
              disabled={!isInteractive}
            />
          </div>
        </div>
      );
    
    default:
      return (
        <div className="question-options-display unknown-type">
          <div className="unknown-type-message">Unknown question type</div>
        </div>
      );
  }
};

export { QUESTION_TYPES, QUESTION_TYPE_NAMES };
export default QuestionOptions; 