import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, PieChart, Pie, Cell, ComposedChart, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, AlertTriangle, CheckCircle, Building, Calculator, Users, Printer
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

const KPICard = ({ title, value, subValue, icon: Icon, color, trend, analysis, className }) => (
    <Card className={`shadow-md border-l-4 ${color} hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span>{Math.abs(trend).toFixed(1)}%</span>
                        </div>
                    )}
                </div>
                <Icon className="w-10 h-10 text-gray-600 opacity-50" />
            </div>
            {analysis && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-700">{analysis}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

const AnalysisSection = ({ title, children, level = "warning" }) => {
    const levelStyles = {
        success: "border-l-green-500 bg-green-50",
        warning: "border-l-yellow-500 bg-yellow-50",
        danger: "border-l-red-500 bg-red-50",
        info: "border-l-blue-500 bg-blue-50"
    };

    return (
        <div className={`border-l-4 p-4 rounded-r-lg ${levelStyles[level]} mb-4 card-print`}>
            <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
            <div className="text-sm text-gray-700">{children}</div>
        </div>
    );
};

export default function FinancialAnalysisTab() {
    const [selectedYear, setSelectedYear] = useState('2025');
    const [isLoading, setIsLoading] = useState(false);

    // Datos reales del plan financiero 2025 OMENAR SOLUTIONS SL
    const plan2025Data = {
        year: 2025,
        company_name: "OMENAR SOLUTIONS SL",
        plan_date: "2024-08-27",
        tax_rate: 25,
        iva_rate: 21,
        total_sales: 1052138.41,
        total_variable_costs: 20874.77,
        gross_margin: 1031263.64,
        ebitda: 43085.36,
        net_profit: 13206.30,
        cash_flow: 27869.78,
        total_assets: 576043.70,
        equity: 135896.60,
        financial_debt: 186572.90,
        working_capital: 122690.31,
        employees_count: 26,
        break_even_point: 1034173.58,
        safety_coefficient: 1.02,
        monthly_sales: [112803.75, 114721.25, 85107.70, 88677.21, 83009.00, 81069.50, 80825.00, 80825.00, 80825.00, 80825.00, 81725.00, 81725.00],
        monthly_costs: [2256.08, 2294.43, 1702.15, 1773.54, 1643.68, 1604.89, 1600.00, 1600.00, 1600.00, 1600.00, 1600.00, 1600.00],
        monthly_margins: [110547.68, 112426.83, 83405.55, 86903.67, 81365.32, 79464.61, 79225.00, 79225.00, 79225.00, 79225.00, 80125.00, 80125.00]
    };

    // Balance de Situación - Activos de Partida
    const balanceSheet = {
        nonCurrentAssets: {
            total: 127984.32,
            materialAssets: 130228.22,
            accumulatedDepreciation: -8503.40,
            intangibleAssets: 5491.74,
            intangibleDepreciation: -569.22,
            financialInvestments: 1336.98
        },
        currentAssets: {
            total: 303637.28,
            inventory: 54860.60,
            receivables: 247080.60,
            temporaryInvestments: 936.00,
            cash: 760.08
        },
        equity: {
            total: 122690.31,
            capital: 3500.00,
            reserves: 59129.09,
            retainedEarnings: 53461.22,
            grants: 6600.00
        },
        liabilities: {
            longTerm: 129572.40,
            shortTerm: 179358.89,
            total: 308931.29
        }
    };

    // Líneas de Negocio
    const businessLinesData = [
        { 
            name: 'Trabajos en Obra', 
            value: 1043738.41, 
            percentage: 99.2, 
            margin: 98.0,
            analysis: "Línea principal de negocio con excelente margen bruto del 98%. Representa prácticamente la totalidad de los ingresos."
        },
        { 
            name: 'Alquiler Triplex', 
            value: 1800.00, 
            percentage: 0.2,
            margin: 100.0,
            analysis: "Ingreso complementario por alquiler. Margen del 100% al no tener costes variables asociados."
        },
        { 
            name: 'Alquiler Sagunto', 
            value: 6600.00, 
            percentage: 0.6,
            margin: 100.0,
            analysis: "Segunda fuente de ingresos por alquiler. Contribuye con margen pleno a la rentabilidad."
        }
    ];

    // Plan de Inversiones
    const investmentPlan = {
        2025: {
            buildings: 140000.00,
            financing: "préstamo",
            iva: 29400.00,
            analysis: "Inversión significativa en edificios y construcciones. Financiada íntegramente mediante préstamo bancario."
        }
    };

    // Recursos Humanos
    const hrData = {
        totalEmployees: 26,
        totalCost: 821751.7,
        grossSalary: 622539.2,
        socialSecurity: 199212.5,
        irpfRetention: 62253.9,
        netSalary: 520442.8,
        analysis: "Plantilla estable de 26 empleados. Coste total anual de 821.752€ (78% del EBITDA). Carga social del 32% sobre salario bruto."
    };

    // Datos mensuales para gráficos
    const monthlyData = plan2025Data.monthly_sales.map((sales, index) => ({
        month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][index],
        ventas: Math.round(sales),
        costes: Math.round(plan2025Data.monthly_costs[index]),
        margen: Math.round(plan2025Data.monthly_margins[index]),
        acumulado: Math.round(plan2025Data.monthly_sales.slice(0, index + 1).reduce((sum, val) => sum + val, 0))
    }));

    // Proyección 5 años
    const fiveYearProjection = [
        { year: 2025, ventas: 1052138, ebitda: 43085, beneficio: 13206, cashflow: 27870 },
        { year: 2026, ventas: 1106605, ebitda: 67959, beneficio: 28314, cashflow: 42978 },
        { year: 2027, ventas: 1139803, ebitda: 69997, beneficio: 30849, cashflow: 45212 },
        { year: 2028, ventas: 1173997, ebitda: 72097, beneficio: 33252, cashflow: 47615 },
        { year: 2029, ventas: 1209217, ebitda: 74260, beneficio: 35932, cashflow: 50055 }
    ];

    // Ratios financieros
    const financialRatios = [
        {
            name: 'Margen Bruto',
            value: ((plan2025Data.gross_margin / plan2025Data.total_sales) * 100).toFixed(1) + '%',
            target: '95%',
            status: 'success',
            analysis: 'Excelente margen bruto del 98%. Refleja una estructura de costes muy eficiente.'
        },
        {
            name: 'Margen EBITDA',
            value: ((plan2025Data.ebitda / plan2025Data.total_sales) * 100).toFixed(1) + '%',
            target: '8%',
            status: 'warning',
            analysis: 'Margen EBITDA del 4.1% está por debajo del objetivo. Los gastos de estructura son elevados.'
        },
        {
            name: 'Rentabilidad Patrimonio (ROE)',
            value: ((plan2025Data.net_profit / plan2025Data.equity) * 100).toFixed(1) + '%',
            target: '15%',
            status: 'warning',
            analysis: 'ROE del 9.7% es aceptable pero mejorable. Indica rentabilidad moderada sobre recursos propios.'
        },
        {
            name: 'Coeficiente de Seguridad',
            value: plan2025Data.safety_coefficient.toFixed(2),
            target: '1.20',
            status: 'danger',
            analysis: 'Coeficiente muy bajo (1.02). La empresa opera muy cerca del punto de equilibrio, alto riesgo.'
        },
        {
            name: 'Ratio de Liquidez',
            value: (balanceSheet.currentAssets.total / balanceSheet.liabilities.shortTerm).toFixed(2),
            target: '2.00',
            status: 'warning',
            analysis: 'Liquidez de 1.69 es justa. Capacidad limitada para hacer frente a pagos a corto plazo.'
        },
        {
            name: 'Autonomía Financiera',
            value: ((plan2025Data.equity / plan2025Data.total_assets) * 100).toFixed(1) + '%',
            target: '40%',
            status: 'warning',
            analysis: 'Autonomía del 23.6% indica alta dependencia de financiación externa. Riesgo financiero elevado.'
        }
    ];

    return (
        <div className="space-y-6 printable-area">
            {/* Print-specific Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        margin: 0;
                        background-color: white !important; /* Ensure background is white for printing */
                    }
                    .no-print {
                        display: none !important;
                    }
                    .card-print {
                        page-break-inside: avoid;
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                        background-color: white !important; /* Ensure card background is white */
                    }
                    .section-print {
                        page-break-before: always;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        page-break-after: avoid;
                    }
                    .recharts-wrapper {
                        page-break-inside: avoid;
                    }
                    .recharts-legend-wrapper, .recharts-tooltip-wrapper {
                        visibility: visible !important;
                    }
                }
            `}</style>
            
            {/* Header con información de la empresa */}
            <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-indigo-50 card-print">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl text-blue-900">Plan Financiero OMENAR SOLUTIONS SL</CardTitle>
                            <p className="text-blue-700 mt-2">Análisis Integral Ejercicio 2025 | Fecha Plan: 27 de Agosto 2024</p>
                            <div className="flex gap-4 mt-3">
                                <Badge className="bg-blue-100 text-blue-800">Tipo Impositivo: 25%</Badge>
                                <Badge className="bg-green-100 text-green-800">IVA: 21%</Badge>
                                <Badge className="bg-purple-100 text-purple-800">26 Empleados</Badge>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                             <Building className="w-16 h-16 text-blue-600 opacity-30" />
                             <Button onClick={() => window.print()} className="no-print">
                                <Printer className="w-4 h-4 mr-2" />
                                Exportar a PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Facturación Anual" 
                    value="€1.052.138" 
                    subValue="Plan 2025"
                    icon={DollarSign} 
                    color="border-l-blue-500"
                    analysis="Facturación robusta concentrada en trabajos de obra (99.2%). Crecimiento esperado del 5.2% vs ejercicio anterior."
                    className="card-print"
                />
                <KPICard 
                    title="EBITDA" 
                    value="€43.085" 
                    subValue="4.1% s/ventas"
                    icon={TrendingUp} 
                    color="border-l-green-500"
                    analysis="EBITDA por debajo del objetivo (8%). Indica necesidad de optimizar gastos de estructura o incrementar márgenes."
                    className="card-print"
                />
                <KPICard 
                    title="Beneficio Neto" 
                    value="€13.206" 
                    subValue="1.3% s/ventas"
                    icon={Target} 
                    color="border-l-purple-500"
                    analysis="Beneficio neto limitado tras gastos financieros e impuestos. Margen neto del 1.3% es ajustado para el sector."
                    className="card-print"
                />
                <KPICard 
                    title="Cash Flow" 
                    value="€27.870" 
                    subValue="2.6% s/ventas"
                    icon={Activity} 
                    color="border-l-orange-500"
                    analysis="Cash flow positivo gracias a amortizaciones. Capacidad de autofinanciación limitada para futuras inversiones."
                    className="card-print"
                />
            </div>

            {/* Tabs principales de análisis */}
            <Tabs defaultValue="balance" className="w-full">
                <div className="flex overflow-x-auto no-print">
                    <TabsList className="grid w-full grid-cols-8 min-w-max">
                        <TabsTrigger value="balance">Balance</TabsTrigger>
                        <TabsTrigger value="business-lines">Líneas Negocio</TabsTrigger>
                        <TabsTrigger value="monthly">Evolución Mensual</TabsTrigger>
                        <TabsTrigger value="ratios">Ratios</TabsTrigger>
                        <TabsTrigger value="investments">Inversiones</TabsTrigger>
                        <TabsTrigger value="hr">RRHH</TabsTrigger>
                        <TabsTrigger value="treasury">Tesorería</TabsTrigger>
                        <TabsTrigger value="projections">Proyecciones</TabsTrigger>
                    </TabsList>
                </div>

                {/* Tab 1: Balance de Situación */}
                <TabsContent value="balance" className="space-y-6 section-print">
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Balance de Situación - Ejercicio 2025</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Activo */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-blue-800">ACTIVO (€576.044)</h3>
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-lg card-print">
                                            <h4 className="font-medium mb-2">Activo No Corriente: €127.984 (22%)</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Inmovilizado Material</span>
                                                    <span>€130.228</span>
                                                </div>
                                                <div className="flex justify-between text-red-600">
                                                    <span>- Amortización Acumulada</span>
                                                    <span>-€8.503</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Inmovilizado Intangible</span>
                                                    <span>€5.492</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Inversiones Financieras</span>
                                                    <span>€1.337</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg card-print">
                                            <h4 className="font-medium mb-2">Activo Corriente: €303.637 (53%)</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Existencias</span>
                                                    <span>€54.861</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Realizable (Clientes)</span>
                                                    <span>€247.081</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Inversiones Temporales</span>
                                                    <span>€936</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tesorería</span>
                                                    <span>€760</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pasivo */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4 text-green-800">PASIVO + PATRIMONIO NETO</h3>
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 p-4 rounded-lg card-print">
                                            <h4 className="font-medium mb-2">Patrimonio Neto: €122.690 (21%)</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Capital</span>
                                                    <span>€3.500</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Reservas</span>
                                                    <span>€59.129</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Resultados Anteriores</span>
                                                    <span>€53.461</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Subvenciones</span>
                                                    <span>€6.600</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg card-print">
                                            <h4 className="font-medium mb-2">Pasivo No Corriente: €129.572 (23%)</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Préstamos L.P.</span>
                                                    <span>€55.875</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Otros Acreedores L.P.</span>
                                                    <span>€73.697</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-red-50 p-4 rounded-lg card-print">
                                            <h4 className="font-medium mb-2">Pasivo Corriente: €179.359 (31%)</h4>
                                            <div className="text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Créditos C.P.</span>
                                                    <span>€62.333</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Acreedores Comerciales</span>
                                                    <span>€94.678</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Administraciones Públicas</span>
                                                    <span>€20.884</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AnalysisSection title="Análisis del Balance de Situación" level="warning">
                        <p><strong>Fortalezas:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Base sólida de activos materiales (€130k) que respaldan la actividad</li>
                            <li>Buen nivel de existencias y clientes que garantizan continuidad operativa</li>
                            <li>Diversificación en el activo entre fijo y circulante</li>
                        </ul>
                        <p><strong>Debilidades identificadas:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Patrimonio neto limitado (21% del total), alta dependencia de financiación externa</li>
                            <li>Tesorería muy ajustada (€760), riesgo de liquidez</li>
                            <li>Alto nivel de deuda a corto plazo (€179k) que puede generar tensiones financieras</li>
                            <li>Ratio deuda/patrimonio elevado: 2.5x, indica alto apalancamiento</li>
                        </ul>
                        <p><strong>Recomendaciones:</strong> Fortalecer patrimonio neto mediante retención de beneficios, renegociar parte de la deuda a corto plazo para convertirla en largo plazo, y mejorar la gestión de tesorería.</p>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 2: Líneas de Negocio */}
                <TabsContent value="business-lines" className="space-y-6 section-print">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Distribución por Líneas de Negocio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie 
                                            data={businessLinesData} 
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={100} 
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        >
                                            {businessLinesData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `€${Math.round(value).toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Análisis de Contribución por Línea</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {businessLinesData.map((line, index) => (
                                    <div key={line.name} className="bg-gray-50 p-4 rounded-lg card-print">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">{line.name}</h4>
                                            <span className="text-lg font-bold">€{Math.round(line.value).toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                            <div 
                                                className="h-2 rounded-full transition-all duration-300" 
                                                style={{ 
                                                    width: `${line.percentage}%`, 
                                                    backgroundColor: COLORS[index] 
                                                }}
                                            ></div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-2">
                                            {line.percentage}% del total | Margen: {line.margin}%
                                        </div>
                                        <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                            {line.analysis}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <AnalysisSection title="Análisis de la Estructura de Negocio" level="info">
                        <p><strong>Concentración del Negocio:</strong> OMENAR presenta una concentración extrema en la línea "Trabajos en Obra" (99.2% de ingresos), lo que indica especialización pero también riesgo de dependencia.</p>
                        
                        <p className="mt-3"><strong>Análisis de Márgenes:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Trabajos en Obra:</strong> Margen bruto excelente del 98%, indicando alta eficiencia operativa</li>
                            <li><strong>Alquileres:</strong> Margen del 100% al no tener costes variables, generando flujo de caja estable</li>
                        </ul>

                        <p><strong>Diversificación:</strong> Los ingresos por alquiler (0.8% del total) proporcionan estabilidad y flujo recurrente, aunque su impacto es limitado. Se recomienda explorar oportunidades de crecimiento en esta línea.</p>
                        
                        <p className="mt-3"><strong>Recomendaciones Estratégicas:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Desarrollar plan de diversificación para reducir dependencia de trabajos en obra</li>
                            <li>Ampliar cartera de alquileres como fuente de ingresos recurrentes</li>
                            <li>Mantener la excelencia operativa en la línea principal</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 3: Evolución Mensual */}
                <TabsContent value="monthly" className="space-y-6 section-print">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Evolución Mensual de Ingresos y Márgenes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <ComposedChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis formatter={(value) => `€${Math.round(value/1000)}K`} />
                                        <Tooltip formatter={(value, name) => [
                                            `€${Math.round(value).toLocaleString()}`, 
                                            name === 'ventas' ? 'Ventas' : name === 'costes' ? 'Costes Variables' : 'Margen Bruto'
                                        ]} />
                                        <Legend />
                                        <Bar dataKey="ventas" fill="#3B82F6" name="ventas" />
                                        <Bar dataKey="costes" fill="#EF4444" name="costes" />
                                        <Line type="monotone" dataKey="margen" stroke="#10B981" strokeWidth={3} name="margen" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Facturación Acumulada 2025</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis formatter={(value) => `€${Math.round(value/1000)}K`} />
                                        <Tooltip formatter={(value) => [`€${Math.round(value).toLocaleString()}`, 'Acumulado']} />
                                        <Area type="monotone" dataKey="acumulado" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Análisis de Estacionalidad */}
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Análisis de Estacionalidad y Tendencias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <h4 className="font-semibold text-green-600 mb-2">Mejor Trimestre</h4>
                                    <p className="text-2xl font-bold text-green-700">Q1 2025</p>
                                    <p className="text-sm text-gray-600">€312.632 (29.7%)</p>
                                    <p className="text-xs text-green-600 mt-1">Ene-Mar: Arranque fuerte</p>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold text-orange-600 mb-2">Trimestre Débil</h4>
                                    <p className="text-2xl font-bold text-orange-700">Q3 2025</p>
                                    <p className="text-sm text-gray-600">€242.475 (23.0%)</p>
                                    <p className="text-xs text-orange-600 mt-1">Jul-Sep: Período estival</p>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold text-blue-600 mb-2">Variabilidad</h4>
                                    <p className="text-2xl font-bold text-blue-700">28.9%</p>
                                    <p className="text-sm text-gray-600">Diferencia Q1-Q3</p>
                                    <p className="text-xs text-blue-600 mt-1">Estacionalidad moderada</p>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold text-purple-600 mb-2">Tendencia</h4>
                                    <p className="text-2xl font-bold text-purple-700">Estable</p>
                                    <p className="text-sm text-gray-600">H2 más regular</p>
                                    <p className="text-xs text-purple-600 mt-1">€80-82k/mes promedio</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AnalysisSection title="Análisis de la Estacionalidad del Negocio" level="info">
                        <p><strong>Patrón Estacional Identificado:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Q1 (Ene-Mar):</strong> Período de máxima actividad con €312k (29.7%). Aprovechamiento de condiciones climáticas favorables</li>
                            <li><strong>Q2 (Abr-Jun):</strong> Mantenimiento del ritmo con €252k (24.0%), ligera desaceleración hacia verano</li>
                            <li><strong>Q3 (Jul-Sep):</strong> Período más débil con €242k (23.0%), impacto de vacaciones y climatología</li>
                            <li><strong>Q4 (Oct-Dic):</strong> Recuperación parcial con €244k (23.2%), incorporación de alquileres</li>
                        </ul>

                        <p><strong>Implicaciones Financieras:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>La variabilidad del 29% entre trimestres requiere gestión activa del cash flow</li>
                            <li>Los meses de verano (Jul-Sep) presentan riesgo de tensión de tesorería</li>
                            <li>La estabilización en H2 facilita la planificación financiera</li>
                        </ul>

                        <p><strong>Recomendaciones Operativas:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Planificar inversiones y pagos importantes en Q1 cuando la generación de caja es mayor</li>
                            <li>Establecer líneas de crédito estacionales para Q3</li>
                            <li>Considerar actividades complementarias para suavizar la estacionalidad</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 4: Ratios Financieros */}
                <TabsContent value="ratios" className="space-y-6 section-print">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Ratios de Rentabilidad</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {financialRatios.slice(0, 3).map((ratio, index) => (
                                    <div key={ratio.name} className={`p-4 border rounded-lg ${
                                        ratio.status === 'success' ? 'border-green-200 bg-green-50' :
                                        ratio.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-red-200 bg-red-50'
                                    } card-print`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                {ratio.status === 'success' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{ratio.name}</p>
                                                    <p className="text-sm text-gray-600">Objetivo: {ratio.target}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${
                                                    ratio.status === 'success' ? 'text-green-600' : 
                                                    ratio.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                                                }`}>
                                                    {ratio.value}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs bg-white p-2 rounded border-l-2 border-gray-400">
                                            {ratio.analysis}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="card-print">
                            <CardHeader>
                                <CardTitle>Ratios de Solvencia y Riesgo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {financialRatios.slice(3, 6).map((ratio, index) => (
                                    <div key={ratio.name} className={`p-4 border rounded-lg ${
                                        ratio.status === 'success' ? 'border-green-200 bg-green-50' :
                                        ratio.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-red-200 bg-red-50'
                                    } card-print`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                {ratio.status === 'success' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                ) : ratio.status === 'danger' ? (
                                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{ratio.name}</p>
                                                    <p className="text-sm text-gray-600">Objetivo: {ratio.target}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-bold ${
                                                    ratio.status === 'success' ? 'text-green-600' : 
                                                    ratio.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                                                }`}>
                                                    {ratio.value}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs bg-white p-2 rounded border-l-2 border-gray-400">
                                            {ratio.analysis}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Punto de Equilibrio */}
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Análisis del Punto de Equilibrio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500 card-print">
                                    <h4 className="font-semibold text-blue-800 mb-2">Punto de Equilibrio</h4>
                                    <p className="text-3xl font-bold text-blue-900">€1.034.174</p>
                                    <p className="text-sm text-blue-700 mt-1">Facturación mínima</p>
                                    <p className="text-xs text-blue-600 mt-2">98.3% de la facturación actual</p>
                                </div>
                                <div className="text-center p-6 bg-green-50 rounded-lg border-l-4 border-green-500 card-print">
                                    <h4 className="font-semibold text-green-800 mb-2">Margen de Seguridad</h4>
                                    <p className="text-3xl font-bold text-green-900">€17.964</p>
                                    <p className="text-sm text-green-700 mt-1">Exceso sobre equilibrio</p>
                                    <p className="text-xs text-green-600 mt-2">1.7% de las ventas actuales</p>
                                </div>
                                <div className="text-center p-6 bg-red-50 rounded-lg border-l-4 border-red-500 card-print">
                                    <h4 className="font-semibold text-red-800 mb-2">Coeficiente Seguridad</h4>
                                    <p className="text-3xl font-bold text-red-900">1.02</p>
                                    <p className="text-sm text-red-700 mt-1">Riesgo CRÍTICO</p>
                                    <p className="text-xs text-red-600 mt-2">Muy cerca del punto de equilibrio</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AnalysisSection title="Evaluación Crítica de la Situación Financiera" level="danger">
                        <p><strong>SITUACIÓN DE RIESGO IDENTIFICADA:</strong> El análisis revela una situación financiera que requiere atención inmediata.</p>
                        
                        <p className="mt-3"><strong>Principales Riesgos:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Coeficiente de Seguridad Crítico (1.02):</strong> La empresa opera prácticamente en su punto de equilibrio. Una caída de ventas del 2% generaría pérdidas</li>
                            <li><strong>Baja Autonomía Financiera (23.6%):</strong> Alta dependencia de financiación externa, vulnerabilidad ante restricciones crediticias</li>
                            <li><strong>Liquidez Justa (1.69):</strong> Capacidad limitada para hacer frente a obligaciones inmediatas</li>
                            <li><strong>Alto Apalancamiento:</strong> Ratio deuda/patrimonio de 2.5x indica estructura financiera arriesgada</li>
                        </ul>

                        <p><strong>Plan de Acción Urgente:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Reducir gastos fijos para mejorar el margen de seguridad</li>
                            <li>Renegociar condiciones de deuda para aliviar presión financiera</li>
                            <li>Fortalecer patrimonio neto mediante retención de beneficios</li>
                            <li>Diversificar fuentes de ingresos para reducir riesgo operativo</li>
                            <li>Implementar control estricto de tesorería y cash flow</li>
                        </ul>

                        <p><strong>Oportunidades:</strong> El excelente margen bruto (98%) indica eficiencia operativa que puede aprovecharse mediante optimización de la estructura de costes fijos.</p>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 5: Plan de Inversiones */}
                <TabsContent value="investments" className="space-y-6 section-print">
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Plan de Inversiones 2025-2029</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg card-print">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4">Inversión Principal 2025</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Edificios y Construcciones</span>
                                            <span className="font-bold">€140.000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">IVA (21%)</span>
                                            <span className="text-sm">€29.400</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">Total Inversión</span>
                                            <span className="font-bold text-blue-800">€169.400</span>
                                        </div>
                                        <div className="bg-white p-3 rounded mt-4">
                                            <p className="text-sm"><strong>Financiación:</strong> 100% Préstamo Bancario</p>
                                            <p className="text-sm"><strong>Propósito:</strong> Ampliación capacidad operativa</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-6 rounded-lg card-print">
                                    <h3 className="text-lg font-semibold text-green-800 mb-4">Impacto Financiero</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Incremento Activo</span>
                                            <span className="font-bold">+24.3%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nueva Deuda L.P.</span>
                                            <span className="font-bold">€140.000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ratio Deuda/Activo</span>
                                            <span className="font-bold text-orange-600">68.5%</span>
                                        </div>
                                        <div className="bg-white p-3 rounded mt-4">
                                            <p className="text-xs text-gray-700">Esta inversión incrementará significativamente el apalancamiento, requiriendo monitoreo estricto de la capacidad de pago.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calendario de amortización */}
                            <div className="mt-6 bg-gray-50 p-6 rounded-lg card-print">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Estructura de Financiación</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Préstamo Existente</p>
                                        <p className="text-2xl font-bold text-blue-600">€55.875</p>
                                        <p className="text-xs text-gray-500">5% interés | 7 años</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Nuevo Préstamo 2025</p>
                                        <p className="text-2xl font-bold text-green-600">€140.000</p>
                                        <p className="text-xs text-gray-500">5% interés | 7 años</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Deuda Total</p>
                                        <p className="text-2xl font-bold text-red-600">€186.573</p>
                                        <p className="text-xs text-gray-500">Carga financiera total</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <AnalysisSection title="Análisis del Plan de Inversiones" level="warning">
                        <p><strong>Evaluación de la Inversión:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Magnitud:</strong> €140k representa el 24% del activo actual y el 114% del patrimonio neto</li>
                            <li><strong>Financiación:</strong> 100% mediante préstamo aumenta el riesgo financiero significativamente</li>
                            <li><strong>Timing:</strong> Ejecutar esta inversión con el actual coeficiente de seguridad (1.02) es arriesgado</li>
                        </ul>

                        <p><strong>Impacto en la Estructura Financiera:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Incremento de gastos financieros anuales: ~€7.000 adicionales</li>
                            <li>Nueva cuota mensual: €2.741 (periodo carencia + amortización)</li>
                            <li>Ratio deuda/EBITDA aumenta a 4.3x (nivel de riesgo alto)</li>
                        </ul>

                        <p><strong>Recomendaciones:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Aplazar la inversión hasta mejorar el coeficiente de seguridad a 1.15+</li>
                            <li>Considerar financiación mixta (50% préstamo + 50% recursos propios/subvenciones)</li>
                            <li>Evaluar el ROI proyectado de la inversión para justificar el riesgo adicional</li>
                            <li>Establecer covenants financieros con la entidad prestamista</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 6: Recursos Humanos */}
                <TabsContent value="hr" className="space-y-6 section-print">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-blue-50 border-blue-200 card-print">
                            <CardContent className="p-6 text-center">
                                <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <p className="text-3xl font-bold text-blue-900">{hrData.totalEmployees}</p>
                                <p className="text-blue-700 font-medium">Empleados Total</p>
                                <p className="text-xs text-blue-600 mt-2">Plantilla estable</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-50 border-green-200 card-print">
                            <CardContent className="p-6 text-center">
                                <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-green-900">€821.752</p>
                                <p className="text-green-700 font-medium">Coste Total Anual</p>
                                <p className="text-xs text-green-600 mt-2">78% del EBITDA</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-purple-50 border-purple-200 card-print">
                            <CardContent className="p-6 text-center">
                                <Calculator className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-purple-900">€31.606</p>
                                <p className="text-purple-700 font-medium">Coste por Empleado</p>
                                <p className="text-xs text-purple-600 mt-2">Incluye cargas sociales</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Estructura Detallada de Costes de Personal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800">Desglose de Costes</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 card-print">
                                        <div className="flex justify-between">
                                            <span>Salario Bruto Anual</span>
                                            <span className="font-bold">€622.539</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Seguridad Social Empresa (32%)</span>
                                            <span className="font-bold text-orange-600">€199.213</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">COSTE TOTAL EMPRESA</span>
                                            <span className="font-bold text-red-700">€821.752</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800">Distribución al Empleado</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 card-print">
                                        <div className="flex justify-between">
                                            <span>Salario Bruto</span>
                                            <span className="font-bold">€622.539</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>IRPF (10%)</span>
                                            <span className="font-bold text-red-600">-€62.254</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Seg. Social Empleado (6.4%)</span>
                                            <span className="font-bold text-red-600">-€39.843</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-medium">SALARIO NETO</span>
                                            <span className="font-bold text-green-700">€520.443</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico de distribución */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Distribución del Gasto en Personal</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie 
                                            data={[
                                                { name: 'Salario Neto', value: 520443, fill: '#10B981' },
                                                { name: 'IRPF', value: 62254, fill: '#EF4444' },
                                                { name: 'SS Empleado', value: 39843, fill: '#F59E0B' },
                                                { name: 'SS Empresa', value: 199213, fill: '#8B5CF6' }
                                            ]}
                                            cx="50%" 
                                            cy="50%" 
                                            outerRadius={100} 
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        />
                                        <Tooltip formatter={(value) => `€${Math.round(value).toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <AnalysisSection title="Análisis de la Estructura de Personal" level="info">
                        <p><strong>Dimensionamiento de Plantilla:</strong> Con 26 empleados y una facturación de €1.052k, se obtiene una productividad de €40.467 por empleado/año, ratio aceptable para el sector.</p>

                        <p className="mt-3"><strong>Peso de Personal en la Estructura:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Sobre Ventas:</strong> 78.1% - Peso muy elevado que presiona la rentabilidad</li>
                            <li><strong>Sobre EBITDA:</strong> 1.907% - Los costes de personal consumen prácticamente todo el EBITDA</li>
                            <li><strong>Coste unitario:</strong> €31.606/empleado/año - Nivel competitivo incluyendo cargas</li>
                        </ul>

                        <p><strong>Eficiencia del Gasto:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Cargas sociales del 32% están en línea con normativa vigente</li>
                            <li>Retención IRPF del 10% indica salarios medios ajustados</li>
                            <li>Ratio salario neto/bruto del 83.6% es eficiente</li>
                        </ul>

                        <p><strong>Recomendaciones Estratégicas:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Evaluar productividad individual para identificar oportunidades de optimización</li>
                            <li>Considerar esquemas de remuneración variable ligados a objetivos</li>
                            <li>Analizar posibilidades de subcontratación para trabajos estacionales</li>
                            <li>Implementar planes de formación para mejorar la eficiencia por empleado</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 7: Plan de Tesorería */}
                <TabsContent value="treasury" className="space-y-6 section-print">
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Evolución de Tesorería 2025</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={[
                                    {month: 'Ene', cobros: 112804, pagos: 109598, saldoFinal: 3206},
                                    {month: 'Feb', cobros: 119909, pagos: 88760, saldoFinal: 34355},
                                    {month: 'Mar', cobros: 90296, pagos: 88403, saldoFinal: 36248},
                                    {month: 'Abr', cobros: 93865, pagos: 88130, saldoFinal: 41983},
                                    {month: 'May', cobros: 88370, pagos: 87972, saldoFinal: 42381},
                                    {month: 'Jun', cobros: 89660, pagos: 88285, saldoFinal: 43756},
                                    {month: 'Jul', cobros: 99186, pagos: 87997, saldoFinal: 54945},
                                    {month: 'Aug', cobros: 87686, pagos: 88006, saldoFinal: 54625},
                                    {month: 'Sep', cobros: 88686, pagos: 88355, saldoFinal: 54956},
                                    {month: 'Oct', cobros: 86186, pagos: 118005, saldoFinal: 23137},
                                    {month: 'Nov', cobros: 109419, pagos: 90000, saldoFinal: 42556},
                                    {month: 'Dic', cobros: 87275, pagos: 90360, saldoFinal: 39471}
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(value, name) => [
                                        `€${Math.round(value).toLocaleString()}`, 
                                        name === 'cobros' ? 'Cobros' : name === 'pagos' ? 'Pagos' : 'Saldo Final'
                                    ]} />
                                    <Legend />
                                    <Bar dataKey="cobros" fill="#10B981" name="Cobros" />
                                    <Bar dataKey="pagos" fill="#EF4444" name="Pagos" />
                                    <Line type="monotone" dataKey="saldoFinal" stroke="#3B82F6" strokeWidth={3} name="Saldo Final" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-green-50 border-green-200 card-print">
                            <CardContent className="p-6 text-center">
                                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-green-900">€54.945</p>
                                <p className="text-green-700 font-medium">Pico de Tesorería</p>
                                <p className="text-xs text-green-600 mt-2">Julio 2025</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-red-50 border-red-200 card-print">
                            <CardContent className="p-6 text-center">
                                <TrendingDown className="w-12 h-12 text-red-600 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-red-900">€23.137</p>
                                <p className="text-red-700 font-medium">Mínimo de Tesorería</p>
                                <p className="text-xs text-red-600 mt-2">Octubre 2025 (post-pago impuestos)</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-blue-50 border-blue-200 card-print">
                            <CardContent className="p-6 text-center">
                                <Activity className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                <p className="text-2xl font-bold text-blue-900">€79.333</p>
                                <p className="text-blue-700 font-medium">Línea de Crédito</p>
                                <p className="text-xs text-blue-600 mt-2">Utilizada al cierre de Diciembre</p>
                            </CardContent>
                        </Card>
                    </div>

                    <AnalysisSection title="Análisis Crítico del Plan de Tesorería" level="danger">
                        <p><strong>ALERTAS CRÍTICAS IDENTIFICADAS:</strong></p>
                        
                        <p className="mt-3"><strong>Tensión de Liquidez en Q4:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>El plan original preveía saldos negativos en Octubre y Diciembre. <strong>Se ha ajustado para reflejar el uso de la póliza de crédito, evitando el descubierto.</strong></li>
                            <li><strong>Octubre 2025:</strong> El saldo cae a su punto más bajo (€23k) debido al pago de impuestos. Es un momento de máxima vulnerabilidad.</li>
                            <li><strong>Dependencia de crédito:</strong> El uso de la póliza de crédito es intensivo. Al cierre del año, se está utilizando la totalidad del disponible.</li>
                        </ul>

                        <p><strong>Factores de Riesgo:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Estacionalidad adversa en Q3/Q4 coincide con vencimientos fiscales y de deuda.</li>
                            <li>Un retraso en el cobro de un cliente importante en Q4 podría ser crítico.</li>
                            <li>La inversión de €169k (con IVA) agrava la presión sobre la tesorería.</li>
                        </ul>

                        <p><strong>Plan de Contingencia Urgente:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Ampliar línea de crédito a €120k mínimo</strong> antes de Q4 como colchón de seguridad.</li>
                            <li>Negociar facilidades de pago (confirming/factoring) con proveedores principales para aliviar salidas.</li>
                            <li>Ofrecer descuentos por pronto pago para acelerar cobros en Q3 y Q4.</li>
                            <li>Diferir pagos no críticos al siguiente ejercicio si es posible.</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>

                {/* Tab 8: Proyecciones */}
                <TabsContent value="projections" className="space-y-6 section-print">
                    <Card className="card-print">
                        <CardHeader>
                            <CardTitle>Proyecciones Financieras 2025-2029</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={fiveYearProjection}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `€${(value/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(value, name) => [
                                        `€${Math.round(value).toLocaleString()}`, 
                                        name === 'ventas' ? 'Ventas' : 
                                        name === 'ebitda' ? 'EBITDA' : 
                                        name === 'beneficio' ? 'Beneficio Neto' : 'Cash Flow'
                                    ]} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="ventas" fill="#3B82F6" name="Ventas" />
                                    <Line yAxisId="right" type="monotone" dataKey="ebitda" stroke="#10B981" strokeWidth={3} name="EBITDA" />
                                    <Line yAxisId="right" type="monotone" dataKey="beneficio" stroke="#F59E0B" strokeWidth={3} name="Beneficio Neto" />
                                    <Line yAxisId="right" type="monotone" dataKey="cashflow" stroke="#8B5CF6" strokeWidth={3} name="Cash Flow" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="text-center bg-blue-50 card-print">
                            <CardContent className="p-6">
                                <h4 className="font-semibold mb-2 text-blue-800">Crecimiento Promedio</h4>
                                <p className="text-3xl font-bold text-blue-900">3.0%</p>
                                <p className="text-sm text-blue-600">Ventas anuales 2026-2029</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center bg-green-50 card-print">
                            <CardContent className="p-6">
                                <h4 className="font-semibold mb-2 text-green-800">EBITDA 2029</h4>
                                <p className="text-3xl font-bold text-green-900">6.1%</p>
                                <p className="text-sm text-green-600">Margen EBITDA objetivo</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center bg-purple-50 card-print">
                            <CardContent className="p-6">
                                <h4 className="font-semibold mb-2 text-purple-800">Beneficio 2029</h4>
                                <p className="text-3xl font-bold text-purple-900">€35.932</p>
                                <p className="text-sm text-purple-600">+172% vs 2025</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center bg-orange-50 card-print">
                            <CardContent className="p-6">
                                <h4 className="font-semibold mb-2 text-orange-800">Cash Flow 2029</h4>
                                <p className="text-3xl font-bold text-orange-900">€50.055</p>
                                <p className="text-sm text-orange-600">+80% vs 2025</p>
                            </CardContent>
                        </Card>
                    </div>

                    <AnalysisSection title="Evaluación del Plan Quinquenal 2025-2029" level="success">
                        <p><strong>VISIÓN ESTRATÉGICA POSITIVA:</strong> El plan quinquenal muestra una clara mejoría de la situación financiera a medio plazo.</p>
                        
                        <p className="mt-3"><strong>Tendencias Favorables:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>Crecimiento Sostenible:</strong> 3% anual en ventas, realista y alcanzable</li>
                            <li><strong>Mejora de Márgenes:</strong> EBITDA pasa del 4.1% al 6.1%, indica optimización de costes</li>
                            <li><strong>Rentabilidad Creciente:</strong> Beneficio neto se multiplica por 2.7x en el periodo</li>
                            <li><strong>Cash Flow Robusto:</strong> Crecimiento del 80% mejora capacidad de autofinanciación</li>
                        </ul>

                        <p><strong>Hitos Clave del Plan:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li><strong>2026:</strong> Punto de inflexión con EBITDA de €67.959 (+58% vs 2025)</li>
                            <li><strong>2027-2029:</strong> Consolidación del crecimiento con márgenes estables</li>
                            <li><strong>Efecto Escala:</strong> Los costes fijos se diluyen con el crecimiento de ventas</li>
                        </ul>

                        <p><strong>Factores Críticos de Éxito:</strong></p>
                        <ul className="list-disc ml-4 mb-3">
                            <li>Mantener el excelente margen bruto del 98%</li>
                            <li>Control riguroso de gastos de estructura</li>
                            <li>Ejecución exitosa del plan de inversiones</li>
                            <li>Gestión activa del riesgo financiero en 2025</li>
                        </ul>

                        <p><strong>Riesgos del Plan:</strong></p>
                        <ul className="list-disc ml-4">
                            <li>Asume estabilidad del sector de la construcción</li>
                            <li>No contempla shocks externos (crisis económicas, cambios regulatorios)</li>
                            <li>Proyecciones optimistas requieren ejecución perfecta</li>
                            <li>Alta sensibilidad a desviaciones en 2025 por bajo coeficiente de seguridad</li>
                        </ul>
                    </AnalysisSection>
                </TabsContent>
            </Tabs>

            {/* Resumen Ejecutivo Final */}
            <Card className="mt-8 bg-gradient-to-r from-gray-900 to-blue-900 text-white card-print">
                <CardHeader>
                    <CardTitle className="text-2xl">Resumen Ejecutivo - Recomendaciones Prioritarias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-red-700 bg-opacity-50 p-4 rounded-lg card-print">
                            <h4 className="font-bold mb-2">🚨 URGENTE (0-3 meses)</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Ampliar línea de crédito a €120k</li>
                                <li>• Diferir inversión de €140k hasta 2026</li>
                                <li>• Implementar control de tesorería semanal</li>
                                <li>• Renegociar términos de pago con proveedores</li>
                            </ul>
                        </div>
                        <div className="bg-yellow-700 bg-opacity-50 p-4 rounded-lg card-print">
                            <h4 className="font-bold mb-2">⚠️ IMPORTANTE (3-12 meses)</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Optimizar gastos fijos para mejorar EBITDA</li>
                                <li>• Diversificar líneas de ingreso</li>
                                <li>• Fortalecer patrimonio neto</li>
                                <li>• Desarrollar plan de contingencia financiera</li>
                            </ul>
                        </div>
                        <div className="bg-green-700 bg-opacity-50 p-4 rounded-lg card-print">
                            <h4 className="font-bold mb-2">📈 ESTRATÉGICO (1-5 años)</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Ejecutar plan de crecimiento 3% anual</li>
                                <li>• Alcanzar margen EBITDA del 6%</li>
                                <li>• Consolidar posición competitiva</li>
                                <li>• Evaluar oportunidades de expansión</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}