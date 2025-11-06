import React, { useState, useCallback } from 'react';
import type { PurchaseOrder } from './types';
// import OrderSummary from './components/OrderSummary';
// import { UploadIcon, PdfIcon, SheetIcon, FileIcon, TrashIcon } from './components/icons'; // LINHA COMENTADA

declare var XLSX: any;

interface ProcessedFile {
  originalFile: File;
  content: string;
  isPreviewableImage: boolean;
}

const App: React.FC = () => {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [orderData, setOrderData] = useState<{ fileName: string; data: PurchaseOrder }[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setOrderData(null);
    setProcessedFiles([]);

    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
    ];

    const filePromises = Array.from(files).map((file: File) => {
      return new Promise<ProcessedFile | null>((resolve) => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          setError(`Arquivo '${file.name}' tem um tipo não suportado.`);
          resolve(null);
          return;
        }

        const isSpreadsheet = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.oasis.opendocument.spreadsheet',
        ].includes(file.type);

        const reader = new FileReader();

        reader.onload = (e) => {
          const result = e.target?.result;
          if (!result) {
            resolve(null);
            return;
          }

          if (isSpreadsheet) {
            const data = new Uint8Array(result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            let csvContent = '';
            workbook.SheetNames.forEach((sheetName: string) => {
              const worksheet = workbook.Sheets[sheetName];
              csvContent += XLSX.utils.sheet_to_csv(worksheet);
              csvContent += '\n\n';
            });
            resolve({
              originalFile: file,
              content: csvContent,
              isPreviewableImage: false,
            });
          } else {
            resolve({
              originalFile: file,
              content: result as string,
              isPreviewableImage: file.type.startsWith('image/'),
            });
          }
        };
        
        reader.onerror = () => resolve(null);

        if (isSpreadsheet) {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsDataURL(file);
        }
      });
    });

    Promise.all(filePromises).then(results => {
      setProcessedFiles(results.filter((f): f is ProcessedFile => f !== null));
    });
  };
  
  const handleRemoveFile = (indexToRemove: number) => {
    setProcessedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = useCallback(async () => {
    if (processedFiles.length === 0) {
      setError('Por favor, selecione um ou mais arquivos primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrderData(null);

    try {
      setError("A função de extração ainda não foi implementada.");
    } catch (err) {
      console.error(err);
      setError('Falha ao processar um ou mais pedidos. Por favor, verifique os arquivos e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [processedFiles]);
  
  const renderFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
        return <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-md" onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />;
    }
    // As próximas linhas usam os ícones, então vamos retornar um texto simples por enquanto
    if (file.type === 'application/pdf') {
        return <span className="text-xs">PDF</span>;
    }
    if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.oasis.opendocument.spreadsheet'
    ) {
        return <span className="text-xs">XLSX</span>;
    }
    return <span className="text-xs">FILE</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Extrator de Pedido de Compra
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Carregue um ou mais pedidos e deixe a IA resumir os detalhes para você.
          </p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer w-full min-h-[16rem] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 hover:bg-gray-800 transition-colors duration-300 p-4"
              >
                {processedFiles.length > 0 ? (
                  <div className="w-full">
                    <h3 className="text-center font-semibold text-gray-300 mb-3">Arquivos Selecionados</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {processedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md animate-fade-in">
                          <div className="flex items-center gap-3 overflow-hidden">
                            {renderFileIcon(file.originalFile)}
                            <span className="text-sm font-medium text-gray-200 truncate">{file.originalFile.name}</span>
                          </div>
                          <button
                            onClick={(e) => { e.preventDefault(); handleRemoveFile(index); }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-600 transition-colors"
                            aria-label={`Remover ${file.originalFile.name}`}
                          >
                            {/* <TrashIcon className="w-5 h-5" /> */}
                            <span>X</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {/* <UploadIcon className="mx-auto h-12 w-12 text-gray-500" /> */}
                    <span className="text-2xl">⬆️</span>
                    <span className="mt-2 block text-sm font-medium text-gray-300">
                      Clique para carregar documentos
                    </span>
                    <span className="block text-xs text-gray-500">
                      PNG, JPG, PDF, XLSX, ODS
                    </span>
                  </div>
                )}
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.oasis.opendocument.spreadsheet"
                  multiple
                />
              </label>
              
              <button
                onClick={handleSubmit}
                disabled={processedFiles.length === 0 || isLoading}
                className="w-full sm:w-auto text-lg font-semibold px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
              >
                {isLoading ? 'Processando...' : `Extrair Detalhes (${processedFiles.length})`}
              </button>
            </div>

            <div className="flex flex-col justify-center min-h-[20rem]">
              {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-300">Analisando seus documentos...</p>
                </div>
              )}
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                  <strong className="font-bold">Erro:</strong>
                  <span className="block sm:inline ml-2">{error}</span>
                </div>
              )}
              {orderData && (
                 <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
                    {orderData.map((order, index) => (
                        <div key={index} className="bg-gray-800/70 p-1 rounded-xl border border-gray-700 shadow-lg">
                             <h2 className="text-lg font-bold p-4 text-blue-300 border-b border-gray-700 bg-gray-900/50 rounded-t-lg">
                                Resultado para: <span className="font-mono text-base">{order.fileName}</span>
                            </h2>
                            <div className="p-4">
                                {/* <OrderSummary data={order.data} /> */}
                                <p>O componente OrderSummary está desativado.</p>
                            </div>
                        </div>
                    ))}
                 </div>
              )}
              {!isLoading && !error && !orderData && (
                <div className="text-center text-gray-500">
                  <p>Seu resumo extraído aparecerá aqui.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
