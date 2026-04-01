import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const generateFinancialAnalysis = (analysisData) => {
  const margin = analysisData.margin || 0;
  const marginPct = analysisData.marginPercentage || 0;
  const revenue = analysisData.revenue || 0;
  const expenses = analysisData.totalExpenses || 0;
  const personnelCosts = analysisData.personnelCosts || 0;
  const directExpenses = analysisData.totalDirectExpenses || 0;
  const monthlyData = analysisData.monthlyData || [];
  
  // Análisis de tendencia
  let trend = 'estable';
  let trendDescription = '';
  if (monthlyData.length >= 2) {
    const lastTwo = monthlyData.slice(-2);
    const prevMargin = lastTwo[0]?.margin || 0;
    const currMargin = lastTwo[1]?.margin || 0;
    if (currMargin > prevMargin * 1.1) {
      trend = 'positiva';
      trendDescription = `El margen ha mejorado un ${(((currMargin - prevMargin) / Math.abs(prevMargin || 1)) * 100).toFixed(1)}% respecto al mes anterior.`;
    } else if (currMargin < prevMargin * 0.9) {
      trend = 'negativa';
      trendDescription = `El margen ha disminuido un ${(((prevMargin - currMargin) / Math.abs(prevMargin || 1)) * 100).toFixed(1)}% respecto al mes anterior.`;
    } else {
      trendDescription = 'El margen se mantiene estable respecto al mes anterior.';
    }
  }

  // Ratio de costes de personal
  const personnelRatio = revenue > 0 ? (personnelCosts / revenue) * 100 : 0;
  
  // Puntos fuertes
  const strengths = [];
  if (marginPct >= 20) strengths.push('Excelente margen de beneficio por encima del 20%');
  if (marginPct >= 10 && marginPct < 20) strengths.push('Margen de beneficio saludable entre 10-20%');
  if (personnelRatio < 60) strengths.push('Costes de personal controlados (< 60% de ingresos)');
  if (trend === 'positiva') strengths.push('Tendencia de mejora en los últimos meses');
  if (revenue > 0 && directExpenses < revenue * 0.15) strengths.push('Gastos directos bien optimizados');
  
  // Puntos de mejora
  const improvements = [];
  if (marginPct < 10) improvements.push('Margen por debajo del 10% - revisar estructura de costes');
  if (marginPct < 0) improvements.push('⚠️ PROYECTO EN PÉRDIDAS - Acción urgente requerida');
  if (personnelRatio > 70) improvements.push('Costes de personal elevados (> 70%) - optimizar asignaciones');
  if (trend === 'negativa') improvements.push('Tendencia negativa - analizar causas del descenso');
  if (directExpenses > revenue * 0.25) improvements.push('Gastos directos elevados - negociar con proveedores');
  
  // Recomendaciones
  const recommendations = [];
  if (marginPct < 15) {
    recommendations.push('Revisar las tarifas aplicadas al cliente para asegurar rentabilidad');
  }
  if (personnelRatio > 65) {
    recommendations.push('Evaluar la productividad del equipo y optimizar asignaciones de personal');
  }
  if (monthlyData.length > 0) {
    const avgMonthlyRevenue = monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0) / monthlyData.length;
    if (avgMonthlyRevenue < revenue / monthlyData.length * 0.8) {
      recommendations.push('Considerar certificaciones más frecuentes para mejorar el flujo de caja');
    }
  }
  if (analysisData.fixedExpensesProrated > revenue * 0.1) {
    recommendations.push('Los gastos fijos prorrateados son significativos - aumentar volumen de trabajo');
  }
  recommendations.push('Mantener seguimiento mensual de KPIs para detectar desviaciones a tiempo');

  // Calificación general
  let rating = '';
  let ratingColor = '';
  let ratingIcon = '';
  if (marginPct >= 20) {
    rating = 'EXCELENTE';
    ratingColor = '#166534';
    ratingIcon = '🌟';
  } else if (marginPct >= 15) {
    rating = 'MUY BUENO';
    ratingColor = '#15803d';
    ratingIcon = '✅';
  } else if (marginPct >= 10) {
    rating = 'BUENO';
    ratingColor = '#ca8a04';
    ratingIcon = '👍';
  } else if (marginPct >= 5) {
    rating = 'AJUSTADO';
    ratingColor = '#ea580c';
    ratingIcon = '⚠️';
  } else if (marginPct >= 0) {
    rating = 'CRÍTICO';
    ratingColor = '#dc2626';
    ratingIcon = '🔴';
  } else {
    rating = 'EN PÉRDIDAS';
    ratingColor = '#991b1b';
    ratingIcon = '🚨';
  }

  return {
    trend,
    trendDescription,
    personnelRatio,
    strengths,
    improvements,
    recommendations,
    rating,
    ratingColor,
    ratingIcon
  };
};

const generateProfitabilityChartSVG = (monthlyData, totalExpenses, revenue) => {
  if (!monthlyData || monthlyData.length === 0) return '';
  
  const width = 700;
  const height = 300;
  const padding = { top: 40, right: 30, bottom: 70, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Encontrar valor máximo (incluyendo gastos como umbral y revenue actual)
  const allValues = monthlyData.flatMap(d => [d.revenue || 0, d.expenses || 0]);
  allValues.push(totalExpenses || 0);
  allValues.push(revenue || 0);
  const maxValue = Math.max(...allValues, 1);
  
  // Función para escalar valores
  const scaleY = (value) => {
    return padding.top + chartHeight - (value / maxValue) * chartHeight;
  };
  
  const barWidth = (chartWidth / monthlyData.length) * 0.6;
  const barGap = (chartWidth / monthlyData.length) * 0.4;
  
  // Generar barras de ingresos
  const bars = monthlyData.map((d, i) => {
    const x = padding.left + i * (barWidth + barGap) + barGap / 2;
    const barHeight = ((d.revenue || 0) / maxValue) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    const isProfitable = (d.revenue || 0) >= (d.expenses || 0);
    
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${isProfitable ? '#3b82f6' : '#93c5fd'}" rx="4" />
      <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="10" fill="#1e40af" font-weight="bold">€${((d.revenue || 0) / 1000).toFixed(1)}k</text>
    `;
  }).join('');
  
  // Etiquetas de meses
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthLabels = monthlyData.map((d, i) => {
    const x = padding.left + i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
    const [year, month] = d.month.split('-');
    return `<text x="${x}" y="${height - 35}" text-anchor="middle" font-size="10" fill="#374151" transform="rotate(-45, ${x}, ${height - 35})">${monthNames[parseInt(month) - 1]} ${year.slice(2)}</text>`;
  }).join('');
  
  // Línea de umbral de gastos (usando el promedio de gastos mensuales)
  const avgExpenses = monthlyData.reduce((sum, d) => sum + (d.expenses || 0), 0) / monthlyData.length;
  const thresholdY = scaleY(avgExpenses);
  
  // Grid horizontal
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const value = ratio * maxValue;
    const y = scaleY(value);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e5e7eb" />
      <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">€${(value / 1000).toFixed(0)}k</text>
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#fafafa" rx="8" />
      
      <!-- Título -->
      <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" fill="#1f2937" font-weight="bold">Umbral de Rentabilidad Mensual</text>
      
      ${gridLines}
      ${bars}
      
      <!-- Línea de umbral de gastos -->
      <line x1="${padding.left}" y1="${thresholdY}" x2="${width - padding.right}" y2="${thresholdY}" stroke="#ef4444" stroke-width="3" stroke-dasharray="10 5" />
      <text x="${width - padding.right + 5}" y="${thresholdY + 4}" font-size="10" fill="#ef4444" font-weight="bold">Umbral: €${(avgExpenses / 1000).toFixed(1)}k</text>
      
      ${monthLabels}
      
      <!-- Leyenda -->
      <rect x="${padding.left}" y="${height - 20}" width="15" height="15" fill="#3b82f6" rx="2" />
      <text x="${padding.left + 20}" y="${height - 9}" font-size="10" fill="#374151">Ingresos</text>
      
      <line x1="${padding.left + 100}" y1="${height - 12}" x2="${padding.left + 130}" y2="${height - 12}" stroke="#ef4444" stroke-width="3" stroke-dasharray="5 3" />
      <text x="${padding.left + 135}" y="${height - 9}" font-size="10" fill="#374151">Umbral de Gastos</text>
    </svg>
  `;
};

const generateBarChartSVG = (personnelBreakdown) => {
  if (!personnelBreakdown || personnelBreakdown.length === 0) return '';
  
  const data = personnelBreakdown.slice(0, 8); // Máximo 8 empleados
  const width = 700;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxCost = Math.max(...data.map(d => d.total_cost || 0), 1);
  const barWidth = chartWidth / data.length * 0.7;
  const barGap = chartWidth / data.length * 0.3;
  
  const bars = data.map((emp, i) => {
    const x = padding.left + i * (barWidth + barGap) + barGap / 2;
    const barHeight = ((emp.total_cost || 0) / maxCost) * chartHeight;
    const y = padding.top + chartHeight - barHeight;
    const name = emp.employee_name.split(' ')[0]; // Solo primer nombre
    
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#3b82f6" rx="4" />
      <text x="${x + barWidth / 2}" y="${height - 35}" text-anchor="middle" font-size="9" fill="#374151" transform="rotate(-45, ${x + barWidth / 2}, ${height - 35})">${name}</text>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="9" fill="#1e40af" font-weight="bold">€${((emp.total_cost || 0) / 1000).toFixed(1)}k</text>
    `;
  }).join('');
  
  return `
    <svg width="${width}" height="${height + 30}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height + 30}" fill="#fafafa" rx="8" />
      <text x="${width / 2}" y="20" text-anchor="middle" font-size="14" fill="#374151" font-weight="bold">Coste Total por Empleado</text>
      <g transform="translate(0, 30)">
        ${bars}
      </g>
    </svg>
  `;
};

const generatePDFContent = (project, analysisData) => {
  const now = new Date();
  const dateStr = format(now, "d 'de' MMMM 'de' yyyy", { locale: es });
  
  const formatCurrency = (value) => `€${(value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  const projectTypeLabels = {
    administration: "Por Administración",
    budget: "Por Presupuesto",
    certification: "Por Certificación"
  };
  
  // Generar análisis financiero experto
  const analysis = generateFinancialAnalysis(analysisData);
  
  // Generar gráficos SVG
  const profitabilityChart = generateProfitabilityChartSVG(analysisData.monthlyData, analysisData.totalExpenses, analysisData.revenue);
  const barChart = generateBarChartSVG(analysisData.personnelBreakdown);

  // Crear contenido HTML para el PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Análisis Financiero - ${project.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 40px; 
          color: #333;
          font-size: 12px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 3px solid #2563eb;
        }
        .header h1 { 
          color: #1e40af; 
          font-size: 24px; 
          margin-bottom: 5px;
        }
        .header .subtitle { 
          color: #6b7280; 
          font-size: 14px; 
        }
        .header .date { 
          color: #9ca3af; 
          font-size: 11px; 
          margin-top: 10px;
        }
        .project-info {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 4px solid #2563eb;
        }
        .project-info h2 {
          color: #1e40af;
          font-size: 16px;
          margin-bottom: 10px;
        }
        .project-info .details {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .project-info .detail-item {
          flex: 1;
          min-width: 150px;
        }
        .project-info .label {
          color: #6b7280;
          font-size: 10px;
          text-transform: uppercase;
        }
        .project-info .value {
          font-weight: bold;
          color: #1f2937;
        }
        .summary-cards {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }
        .summary-card {
          flex: 1;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card.revenue { background: #dcfce7; border: 1px solid #86efac; }
        .summary-card.expenses { background: #fee2e2; border: 1px solid #fca5a5; }
        .summary-card.margin { background: #dbeafe; border: 1px solid #93c5fd; }
        .summary-card .amount {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .summary-card.revenue .amount { color: #166534; }
        .summary-card.expenses .amount { color: #991b1b; }
        .summary-card.margin .amount { color: #1e40af; }
        .summary-card .label {
          font-size: 11px;
          color: #6b7280;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          font-size: 11px;
          text-transform: uppercase;
        }
        td {
          font-size: 12px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .total-row {
          background: #f3f4f6;
          font-weight: bold;
        }
        .total-row td {
          border-top: 2px solid #9ca3af;
        }
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .breakdown-item:last-child {
          border-bottom: none;
        }
        .breakdown-item .label {
          color: #4b5563;
        }
        .breakdown-item .value {
          font-weight: 600;
        }
        .sub-item {
          padding-left: 20px;
          font-size: 11px;
          color: #6b7280;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 10px;
        }
        .page-break {
          page-break-before: always;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ANÁLISIS FINANCIERO</h1>
        <div class="subtitle">${project.code} - ${project.name}</div>
        <div class="date">Generado el ${dateStr}</div>
      </div>

      <div class="project-info">
        <h2>Información del Proyecto</h2>
        <div class="details">
          <div class="detail-item">
            <div class="label">Tipo</div>
            <div class="value">${projectTypeLabels[project.project_type] || project.project_type}</div>
          </div>
          <div class="detail-item">
            <div class="label">Cliente</div>
            <div class="value">${project.client_name || 'No especificado'}</div>
          </div>
          <div class="detail-item">
            <div class="label">Estado</div>
            <div class="value">${project.status === 'active' ? 'Activo' : project.status === 'completed' ? 'Completado' : 'Pausado'}</div>
          </div>
          <div class="detail-item">
            <div class="label">Ubicación</div>
            <div class="value">${project.location || 'No especificada'}</div>
          </div>
        </div>
      </div>

      <div class="summary-cards">
        <div class="summary-card revenue">
          <div class="amount">${formatCurrency(analysisData.revenue)}</div>
          <div class="label">Ingresos Totales</div>
        </div>
        <div class="summary-card expenses">
          <div class="amount">${formatCurrency(analysisData.totalExpenses)}</div>
          <div class="label">Gastos Totales</div>
        </div>
        <div class="summary-card margin">
          <div class="amount">${formatCurrency(analysisData.margin)}</div>
          <div class="label">Margen (${(analysisData.marginPercentage || 0).toFixed(1)}%)</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Desglose de Gastos</div>
        <div class="breakdown-item">
          <span class="label">Gastos Directos del Proyecto</span>
          <span class="value">${formatCurrency(analysisData.totalDirectExpenses)}</span>
        </div>
        <div class="breakdown-item">
          <span class="label">Costes de Personal</span>
          <span class="value">${formatCurrency(analysisData.personnelCosts)}</span>
        </div>
        <div class="breakdown-item sub-item">
          <span class="label">• Salarios Proporcionales</span>
          <span class="value">${formatCurrency(analysisData.salaries)}</span>
        </div>
        <div class="breakdown-item sub-item">
          <span class="label">• Horas Extra y Festivas</span>
          <span class="value">${formatCurrency(analysisData.overtimePay)}</span>
        </div>
        <div class="breakdown-item sub-item">
          <span class="label">• Seguridad Social Empresa</span>
          <span class="value">${formatCurrency(analysisData.companySS)}</span>
        </div>
        <div class="breakdown-item sub-item">
          <span class="label">• Gastos Variables Empleados</span>
          <span class="value">${formatCurrency(analysisData.variableExpenses)}</span>
        </div>
        <div class="breakdown-item">
          <span class="label">Gastos Fijos Prorrateados</span>
          <span class="value">${formatCurrency(analysisData.fixedExpensesProrated)}</span>
        </div>
        <div class="breakdown-item total-row" style="background: #f3f4f6; padding: 12px 0; margin-top: 10px;">
          <span class="label" style="font-weight: bold;">TOTAL GASTOS</span>
          <span class="value" style="color: #991b1b;">${formatCurrency(analysisData.totalExpenses)}</span>
        </div>
      </div>

      ${analysisData.personnelBreakdown && analysisData.personnelBreakdown.length > 0 ? `
      <div class="section">
        <div class="section-title">Desglose por Empleado</div>
        <table>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Puesto</th>
              <th class="text-center">Horas</th>
              <th class="text-right">Salario Prop.</th>
              <th class="text-right">H. Extra/Fest.</th>
              <th class="text-right">SS Empresa</th>
              <th class="text-right">G. Variables</th>
              <th class="text-right">G. Fijos</th>
              <th class="text-right">TOTAL</th>
              <th class="text-right" style="background: #e0f2fe;">COSTE/HORA</th>
            </tr>
          </thead>
          <tbody>
            ${analysisData.personnelBreakdown.map(emp => `
              <tr>
                <td>${emp.employee_name}</td>
                <td>${emp.position || '-'}</td>
                <td class="text-center">${(emp.hours_worked || 0).toFixed(1)}h</td>
                <td class="text-right">${formatCurrency(emp.proportional_salary)}</td>
                <td class="text-right">${formatCurrency(emp.overtime_pay)}</td>
                <td class="text-right">${formatCurrency(emp.company_ss)}</td>
                <td class="text-right">${formatCurrency(emp.variable_expenses)}</td>
                <td class="text-right">${formatCurrency(emp.fixed_expenses_prorated)}</td>
                <td class="text-right font-bold">${formatCurrency(emp.total_cost)}</td>
                <td class="text-right font-bold" style="color: #0891b2; background: #ecfeff;">${formatCurrency(emp.cost_per_hour)}/h</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="8"><strong>TOTAL COSTES PERSONAL</strong></td>
              <td class="text-right"><strong>${formatCurrency((analysisData.personnelCosts || 0) + (analysisData.fixedExpensesProrated || 0))}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}

      ${analysisData.monthlyData && analysisData.monthlyData.length > 0 ? `
      <div class="section">
        <div class="section-title">Evolución Mensual</div>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th class="text-right">Ingresos</th>
              <th class="text-right">Gastos</th>
              <th class="text-right">Margen</th>
            </tr>
          </thead>
          <tbody>
            ${analysisData.monthlyData.map(data => {
              const [year, month] = data.month.split('-');
              const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
              return `
                <tr>
                  <td>${monthName}</td>
                  <td class="text-right" style="color: #166534;">${formatCurrency(data.revenue)}</td>
                  <td class="text-right" style="color: #991b1b;">${formatCurrency(data.expenses)}</td>
                  <td class="text-right font-bold" style="color: ${data.margin >= 0 ? '#1e40af' : '#991b1b'};">${formatCurrency(data.margin)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Información de Prorrateo de Gastos Fijos</div>
        <div class="breakdown-item">
          <span class="label">Total Gastos Fijos Empresa (mensual)</span>
          <span class="value">${formatCurrency(analysisData.fixedExpensesDetail?.totalFixedExpenses)}</span>
        </div>
        <div class="breakdown-item">
          <span class="label">Operarios Activos en Empresa</span>
          <span class="value">${analysisData.fixedExpensesDetail?.totalOperarios || 0}</span>
        </div>
        <div class="breakdown-item">
          <span class="label">Horas Trabajadas en Este Proyecto</span>
          <span class="value">${(analysisData.fixedExpensesDetail?.projectHours || 0).toFixed(1)}h</span>
        </div>
        <div class="breakdown-item">
          <span class="label">Proporción Aplicada</span>
          <span class="value">${((analysisData.fixedExpensesDetail?.proportion || 0) * 100).toFixed(2)}%</span>
        </div>
        <div class="breakdown-item" style="background: #fef3c7; padding: 10px; margin-top: 10px; border-radius: 6px;">
          <span class="label" style="font-weight: bold;">Gastos Fijos Prorrateados al Proyecto</span>
          <span class="value" style="color: #92400e;">${formatCurrency(analysisData.fixedExpensesProrated)}</span>
        </div>
      </div>

      ${analysisData.monthlyData && analysisData.monthlyData.length > 0 ? `
      <div class="section page-break">
        <div class="section-title">📊 Umbral de Rentabilidad Mensual</div>
        <div style="text-align: center; margin: 20px 0;">
          ${profitabilityChart}
        </div>
        
        <!-- Leyenda explicativa -->
        <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h4 style="font-weight: bold; color: #374151; margin-bottom: 12px; font-size: 12px;">📊 Cómo interpretar este gráfico:</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 4px; flex-shrink: 0;"></div>
              <div>
                <p style="font-weight: bold; color: #374151;">Barras Azules (Ingresos)</p>
                <p style="color: #6b7280;">Representan los ingresos certificados cada mes.</p>
              </div>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <div style="width: 20px; height: 3px; background: transparent; border-top: 3px dashed #ef4444; flex-shrink: 0; margin-top: 8px;"></div>
              <div>
                <p style="font-weight: bold; color: #374151;">Línea Roja (Umbral de Gastos)</p>
                <p style="color: #6b7280;">Marca el nivel promedio de gastos mensuales.</p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #dcfce7; border-radius: 6px; border: 1px solid #86efac;">
              <span style="font-size: 16px;">✅</span>
              <span style="color: #166534; font-size: 11px;"><strong>Barra supera línea roja = BENEFICIO</strong></span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #fef2f2; border-radius: 6px; border: 1px solid #fca5a5;">
              <span style="font-size: 16px;">⚠️</span>
              <span style="color: #991b1b; font-size: 11px;"><strong>Barra no alcanza línea roja = PÉRDIDA</strong></span>
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      ${analysisData.personnelBreakdown && analysisData.personnelBreakdown.length > 0 ? `
      <div class="section">
        <div class="section-title">👥 Distribución de Costes por Empleado</div>
        <div style="text-align: center; margin: 20px 0;">
          ${barChart}
        </div>
      </div>
      ` : ''}

      <div class="section page-break" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; border: 2px solid #0ea5e9;">
        <div class="section-title" style="border-bottom: none; color: #0369a1;">
          🎯 ANÁLISIS FINANCIERO EXPERTO
        </div>
        
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-size: 40px;">${analysis.ratingIcon}</div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: ${analysis.ratingColor};">${analysis.rating}</div>
            <div style="color: #6b7280; font-size: 12px;">Calificación General del Proyecto</div>
          </div>
          <div style="margin-left: auto; text-align: right;">
            <div style="font-size: 28px; font-weight: bold; color: ${(analysisData.marginPercentage || 0) >= 0 ? '#166534' : '#991b1b'};">
              ${(analysisData.marginPercentage || 0).toFixed(1)}%
            </div>
            <div style="color: #6b7280; font-size: 12px;">Margen de Beneficio</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px;">📈 Tendencia: ${analysis.trend.toUpperCase()}</div>
          <p style="color: #4b5563; font-size: 12px;">${analysis.trendDescription}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="padding: 15px; background: #dcfce7; border-radius: 8px; border: 1px solid #86efac;">
            <div style="font-weight: bold; color: #166534; margin-bottom: 10px;">✅ PUNTOS FUERTES</div>
            ${analysis.strengths.length > 0 ? 
              analysis.strengths.map(s => `<div style="font-size: 11px; color: #166534; margin-bottom: 5px;">• ${s}</div>`).join('') :
              '<div style="font-size: 11px; color: #6b7280;">No se identificaron puntos fuertes destacables</div>'
            }
          </div>
          <div style="padding: 15px; background: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5;">
            <div style="font-weight: bold; color: #991b1b; margin-bottom: 10px;">⚠️ ÁREAS DE MEJORA</div>
            ${analysis.improvements.length > 0 ? 
              analysis.improvements.map(i => `<div style="font-size: 11px; color: #991b1b; margin-bottom: 5px;">• ${i}</div>`).join('') :
              '<div style="font-size: 11px; color: #6b7280;">No se identificaron áreas críticas de mejora</div>'
            }
          </div>
        </div>

        <div style="padding: 15px; background: #fefce8; border-radius: 8px; border: 1px solid #fde047;">
          <div style="font-weight: bold; color: #854d0e; margin-bottom: 10px;">💡 RECOMENDACIONES</div>
          ${analysis.recommendations.map((r, i) => `
            <div style="font-size: 11px; color: #713f12; margin-bottom: 8px; padding-left: 15px;">
              ${i + 1}. ${r}
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;">
          <div style="font-weight: bold; color: #374151; margin-bottom: 10px;">📊 INDICADORES CLAVE (KPIs)</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #1f2937;">${analysis.personnelRatio.toFixed(1)}%</div>
              <div style="font-size: 10px; color: #6b7280;">Ratio Costes Personal</div>
              <div style="font-size: 9px; color: ${analysis.personnelRatio <= 60 ? '#166534' : analysis.personnelRatio <= 70 ? '#ca8a04' : '#dc2626'};">
                ${analysis.personnelRatio <= 60 ? '✓ Óptimo' : analysis.personnelRatio <= 70 ? '⚠ Moderado' : '✗ Alto'}
              </div>
            </div>
            <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #1f2937;">${formatCurrency((analysisData.revenue || 0) / (analysisData.personnelBreakdown?.reduce((sum, e) => sum + (e.hours_worked || 0), 0) || 1))}</div>
              <div style="font-size: 10px; color: #6b7280;">Ingreso por Hora (sin IVA)</div>
            </div>
            <div style="text-align: center; padding: 10px; background: #f3f4f6; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #1f2937;">${analysisData.personnelBreakdown?.length || 0}</div>
              <div style="font-size: 10px; color: #6b7280;">Empleados Asignados</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>OMENAR SOLUTIONS SL - Informe de Análisis Financiero</p>
        <p>Generado el ${dateStr}</p>
        <p style="margin-top: 5px; font-style: italic; color: #9ca3af;">
          Este informe ha sido generado automáticamente con análisis basado en los datos del proyecto.
        </p>
      </div>
    </body>
    </html>
  `;

  return htmlContent;
};

export default function FinancialReportPDF({ project, analysisData, disabled }) {
  const handleDownloadPDF = () => {
    const htmlContent = generatePDFContent(project, analysisData);
    
    // Crear una nueva ventana para imprimir/guardar como PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Esperar a que cargue y luego abrir diálogo de impresión
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <Button 
      onClick={handleDownloadPDF} 
      disabled={disabled}
      className="bg-red-600 hover:bg-red-700"
    >
      <FileDown className="w-4 h-4 mr-2" />
      Descargar PDF
    </Button>
  );
}