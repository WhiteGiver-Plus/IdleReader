import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Upload,
  Maximize2,
  Home,
  Scroll,
  FileText,
  EyeOff
} from 'lucide-react';

// 使用public目录中的worker文件，确保版本匹配
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ className = '' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState('1');
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setPageNumber(1);
      setPageInput('1');
    } else {
      alert('请选择有效的PDF文件');
    }
  }, []);

  // 文档加载成功
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF文档加载成功，页数:', numPages);
    setNumPages(numPages);
  }, []);

  // 文档加载错误
  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF文档加载失败:', error);
    alert(`PDF文档加载失败: ${error.message}`);
  }, []);

  // 页面导航
  const goToPreviousPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
    }
  }, [pageNumber]);

  const goToNextPage = useCallback(() => {
    if (numPages && pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      setPageInput(newPage.toString());
    }
  }, [pageNumber, numPages]);

  // 跳转到指定页面
  const handlePageInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(event.target.value);
  }, []);

  const handlePageInputSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (numPages && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    } else {
      setPageInput(pageNumber.toString());
    }
  }, [pageInput, numPages, pageNumber]);

  // 缩放控制
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40; // 减去padding
      setScale(containerWidth / 595); // A4宽度大约595pt
    }
  }, []);

  // 旋转
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!file) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (!isContinuousMode) {
            event.preventDefault();
            goToPreviousPage();
          }
          break;
        case 'ArrowRight':
          if (!isContinuousMode) {
            event.preventDefault();
            goToNextPage();
          }
          break;
        case '+':
        case '=':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            resetZoom();
          }
          break;
        case 'r':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            rotate();
          }
          break;
        case 'f':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'c':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setIsContinuousMode(!isContinuousMode);
          }
          break;
        case 't':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setIsToolbarVisible(!isToolbarVisible);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, goToPreviousPage, goToNextPage, zoomIn, zoomOut, resetZoom, rotate, toggleFullscreen, isContinuousMode, isToolbarVisible]);

  // 鼠标滚轮缩放
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY;
      if (delta < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [zoomIn, zoomOut]);

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* 工具栏 - 在连续滚动模式下始终在最上方 */}
      {isToolbarVisible && (
        <div className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm ${isContinuousMode ? 'sticky top-0 z-10' : ''}`}>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={20} />
              <span>上传PDF</span>
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {file && (
              <>
                {!isContinuousMode && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={pageNumber <= 1}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pageInput}
                        onChange={handlePageInputChange}
                        className="w-16 px-2 py-1 text-center border border-gray-300 rounded"
                      />
                      <span className="text-gray-600">/ {numPages || 0}</span>
                    </form>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={!numPages || pageNumber >= numPages}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
                  <button
                    onClick={zoomOut}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="缩小"
                  >
                    <ZoomOut size={20} />
                  </button>
                  
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  
                  <button
                    onClick={zoomIn}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="放大"
                  >
                    <ZoomIn size={20} />
                  </button>
                  
                  <button
                    onClick={fitToWidth}
                    className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100"
                    title="适应宽度"
                  >
                    适应宽度
                  </button>
                  
                  <button
                    onClick={resetZoom}
                    className="px-3 py-1 text-sm rounded-lg hover:bg-gray-100"
                    title="重置缩放"
                  >
                    <Home size={16} />
                  </button>
                </div>

                <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
                  <button
                    onClick={rotate}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="旋转"
                  >
                    <RotateCw size={20} />
                  </button>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="全屏"
                  >
                    <Maximize2 size={20} />
                  </button>

                  <button
                    onClick={() => setIsContinuousMode(!isContinuousMode)}
                    className={`p-2 rounded-lg transition-colors ${
                      isContinuousMode 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                    title={isContinuousMode ? "单页模式" : "连续滚动模式"}
                  >
                    {isContinuousMode ? <FileText size={20} /> : <Scroll size={20} />}
                  </button>

                  <button
                    onClick={() => setIsToolbarVisible(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="隐藏工具栏"
                  >
                    <EyeOff size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 工具栏切换按钮 - 当工具栏隐藏时显示 */}
      {!isToolbarVisible && (
        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={() => setIsToolbarVisible(true)}
            className="p-2 bg-white bg-opacity-90 rounded-lg shadow-lg hover:bg-opacity-100 transition-all"
            title="显示工具栏"
          >
            <FileText size={20} />
          </button>
        </div>
      )}

      {/* PDF显示区域 */}
      <div 
        ref={containerRef}
        className={`flex-1 overflow-auto bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}
        onWheel={handleWheel}
      >
        {file ? (
          <div className={`${isContinuousMode ? 'space-y-4' : 'flex justify-center'} p-4`}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-64">
                  <div className="text-lg text-gray-600">加载中...</div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-64">
                  <div className="text-lg text-red-600">加载PDF失败</div>
                </div>
              }
            >
              {isContinuousMode ? (
                // 连续滚动模式：渲染所有页面
                Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className="flex justify-center">
                    <Page
                      pageNumber={index + 1}
                      scale={scale}
                      rotate={rotation}
                      loading={
                        <div className="flex items-center justify-center h-64">
                          <div className="text-lg text-gray-600">渲染页面 {index + 1} 中...</div>
                        </div>
                      }
                      className="shadow-lg"
                    />
                  </div>
                ))
              ) : (
                // 单页模式：只渲染当前页面
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  loading={
                    <div className="flex items-center justify-center h-64">
                      <div className="text-lg text-gray-600">渲染页面中...</div>
                    </div>
                  }
                  className="shadow-lg"
                />
              )}
            </Document>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                选择一个PDF文件开始阅读
              </h3>
              <p className="text-gray-500 mb-4">
                支持拖拽上传或点击按钮选择文件
              </p>
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  选择PDF文件
                </button>
                <div className="text-sm text-gray-500">或者试试示例文档：</div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => loadSamplePDF('dummy.pdf')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📄 示例文档1
                  </button>
                  <button
                    onClick={() => loadSamplePDF('test.pdf')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    📄 示例文档2
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-60 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70"
        >
          退出全屏
        </button>
      )}
    </div>
  );
};
