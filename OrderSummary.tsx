// Arquivo: OrderSummary.tsx

import React from 'react';
import type { PurchaseOrder } from './types';

interface OrderSummaryProps {
  data: PurchaseOrder;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2">
    <dt className="text-sm font-medium text-gray-400">{label}</dt>
    <dd className="mt-1 text-md text-gray-200">{value || 'N/A'}</dd>
  </div>
);

const OrderSummary: React.FC<OrderSummaryProps> = ({ data }) => {
  if (!data) return null;

  return (
    <dl className="space-y-4">
      <SummaryItem label="Número do Pedido" value={data.numero_pedido} />
      <SummaryItem label="Fornecedor" value={data.fornecedor} />
      <SummaryItem label="Data do Pedido" value={data.data_pedido} />
      <SummaryItem label="Total" value={data.total ? `R$ ${data.total.toFixed(2)}` : 'N/A'} />
      
      <div>
        <dt className="text-sm font-medium text-gray-400">Itens</dt>
        {data.itens && data.itens.length > 0 ? (
          <dd className="mt-1">
            <ul className="divide-y divide-gray-700">
              {data.itens.map((item, index) => (
                <li key={index} className="py-2">
                  <p className="text-md text-gray-200">{item.descricao} ({item.quantidade}x)</p>
                  <p className="text-sm text-gray-400">Preço Unitário: R$ {item.preco_unitario.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </dd>
        ) : (
          <dd className="mt-1 text-md text-gray-200">N/A</dd>
        )}
      </div>
    </dl>
  );
};

export default OrderSummary;
