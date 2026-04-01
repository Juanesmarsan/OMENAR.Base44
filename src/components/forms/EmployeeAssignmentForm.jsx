
import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Info, DollarSign, Users, Calculator, FileSpreadsheet, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPERARIO_POSITIONS = ["Peón", "Peón Especialista", "Oficial de 3ª", "Oficial de 2ª", "Oficial de 1ª"];

const initialExpenseState = {
    concept: '',
    description: '',
    total_amount: 0,
    includes_iva: true,
    iva_rate: 21,
    base_amount: 0,
    iva_amount: 0
};

export default function FixedExpensesTab() {
    const [expenses, setExpenses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [newExpense, setNewExpense] = useState(initialExpenseState);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        totalFixedExpenses: 0,
        activeOperarios: 0,
        costPerOperario: 0,
    });

    const calculateFromTotal = (total, includesIva, ivaRate) => {
        const totalNum = parseFloat(total) || 0;
        const rateNum = parseFloat(ivaRate) || 0;

        if (!includesIva || rateNum === 0) {
            return {
                base_amount: totalNum,
                iva_amount: 0,
                total_amount: totalNum
            };
        } else {
            const base = totalNum / (1 + rateNum / 100);
            const iva = totalNum - base;
            return {
                base_amount: base,
                iva_amount: iva,
                total_amount: totalNum
            };
        }
    };

    useEffect(() => {
        const calculated = calculateFromTotal(
            newExpense.total_amount, 
            newExpense.includes_iva, 
            newExpense.iva_rate
        );
        
        setNewExpense(prev => ({
            ...prev,
            base_amount: calculated.base_amount,
            iva_amount: calculated.iva_amount,
        }));
    }, [newExpense.total_amount, newExpense.includes_iva, newExpense.iva_rate]);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [expensesData, employeesData] = await Promise.all([
                base44.entities.FixedExpense.list(),
                base44.entities.Employee.list(),
            ]);
            setExpenses(expensesData);
            setEmployees(employeesData);

            const totalFixed = expensesData.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
            const activeOps = employeesData.filter(emp => emp.status === 'active' && OPERARIO_POSITIONS.includes(emp.position)).length;
            const costPerOp = activeOps > 0 ? totalFixed / activeOps : 0;

            setStats({
                totalFixedExpenses: totalFixed,
                activeOperarios: activeOps,
                costPerOperario: costPerOp,
            });
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSave = async () => {
        try {
            const expenseToSave = {
                concept: newExpense.concept,
                description: newExpense.description,
                total_amount: parseFloat(newExpense.total_amount) || 0,
                base_amount: parseFloat(newExpense.base_amount) || 0,
                iva_rate: parseFloat(newExpense.iva_rate) || 0,
                iva_amount: parseFloat(newExpense.iva_amount) || 0,
            };

            if (editingExpense) {
                await base44.entities.FixedExpense.update(editingExpense.id, expenseToSave);
            } else {
                await base44.entities.FixedExpense.create(expenseToSave);
            }
            setShowForm(false);
            setEditingExpense(null);
            setNewExpense(initialExpenseState);
            loadData();
        } catch (error) {
            console.error("Error saving fixed expense:", error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar este gasto fijo?')) {
            await base44.entities.FixedExpense.delete(id);
            loadData();
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        const includesIva = (expense.iva_amount || 0) > 0;
        setNewExpense({
            concept: expense.concept,
            description: expense.description,
            total_amount: parseFloat(expense.total_amount) || 0,
            includes_iva: includesIva,
            iva_rate: parseFloat(expense.iva_rate) || 21,
            base_amount: parseFloat(expense.base_amount) || 0,
            iva_amount: parseFloat(expense.iva_amount) || 0,
        });
        setShowForm(true);
    };

    const handleNewExpense = () => {
        setEditingExpense(null);
        setNewExpense(initialExpenseState);
        setShowForm(true);
    };

    const exportToExcel = () => {
        try {
            const separator = ';';
            const currentDate = format(new Date(), 'dd/MM/yyyy');
            
            // ENCABEZADO PRINCIPAL CON FORMATO
            const lines = [];
            lines.push('OMENAR SOLUTIONS SL' + separator.repeat(6));
            lines.push('INFORME DE GASTOS FIJOS MENSUALES' + separator.repeat(6));
            lines.push(`Fecha de Generación: ${currentDate}` + separator.repeat(6));
            lines.push(''); // Línea vacía
            
            // RESUMEN EJECUTIVO
            lines.push('=== RESUMEN EJECUTIVO ===' + separator.repeat(6));
            lines.push('Indicador' + separator + 'Valor' + separator.repeat(5));
            lines.push(`Total Gastos Fijos Mensuales${separator}€${stats.totalFixedExpenses.toFixed(2)}${separator.repeat(5)}`);
            lines.push(`Empleados Operarios Activos${separator}${stats.activeOperarios}${separator.repeat(5)}`);
            lines.push(`Coste Fijo por Operario${separator}€${stats.costPerOperario.toFixed(2)}${separator.repeat(5)}`);
            lines.push(''); // Línea vacía
            lines.push(''); // Línea vacía
            
            // TABLA PRINCIPAL - ENCABEZADOS
            lines.push('=== DETALLE DE GASTOS FIJOS ===' + separator.repeat(6));
            const headers = ['Concepto', 'Descripción', 'Base Imponible (€)', 'IVA (%)', 'IVA (€)', 'Total Mensual (€)', 'Última Actualización'];
            lines.push(headers.join(separator));
            
            // DATOS DE GASTOS
            expenses.forEach((exp, index) => {
                const row = [
                    (exp.concept || '').replace(/;/g, ','),
                    (exp.description || '-').replace(/;/g, ','),
                    (exp.base_amount || 0).toFixed(2),
                    (exp.iva_rate || 0).toFixed(0),
                    (exp.iva_amount || 0).toFixed(2),
                    (exp.total_amount || 0).toFixed(2),
                    format(new Date(exp.updated_date), 'dd/MM/yyyy')
                ];
                lines.push(row.join(separator));
            });
            
            // SEPARADOR ANTES DE TOTALES
            lines.push(''); 
            lines.push('='.repeat(80));
            
            // FILA DE TOTALES
            const totalBase = expenses.reduce((sum, exp) => sum + (exp.base_amount || 0), 0);
            const totalIva = expenses.reduce((sum, exp) => sum + (exp.iva_amount || 0), 0);
            const totalAmount = expenses.reduce((sum, exp) => sum + (exp.total_amount || 0), 0);
            
            lines.push([
                '>>> TOTALES',
                '',
                totalBase.toFixed(2),
                '',
                totalIva.toFixed(2),
                totalAmount.toFixed(2),
                ''
            ].join(separator));
            
            lines.push('='.repeat(80));
            lines.push('');
            
            // ANÁLISIS ADICIONAL
            lines.push('=== ANÁLISIS DE DISTRIBUCIÓN ===' + separator.repeat(6));
            lines.push('');
            
            // Categorizar gastos por rango
            const rangeAnalysis = [
                { label: 'Gastos menores a €500', count: 0, total: 0 },
                { label: 'Gastos entre €500 - €1.000', count: 0, total: 0 },
                { label: 'Gastos entre €1.000 - €3.000', count: 0, total: 0 },
                { label: 'Gastos superiores a €3.000', count: 0, total: 0 },
            ];
            
            expenses.forEach(exp => {
                const amount = exp.total_amount || 0;
                if (amount < 500) {
                    rangeAnalysis[0].count++;
                    rangeAnalysis[0].total += amount;
                } else if (amount < 1000) {
                    rangeAnalysis[1].count++;
                    rangeAnalysis[1].total += amount;
                } else if (amount < 3000) {
                    rangeAnalysis[2].count++;
                    rangeAnalysis[2].total += amount;
                } else {
                    rangeAnalysis[3].count++;
                    rangeAnalysis[3].total += amount;
                }
            });
            
            lines.push('Rango' + separator + 'Cantidad' + separator + 'Total (€)' + separator + '% del Total' + separator.repeat(3));
            rangeAnalysis.forEach(range => {
                const percentage = totalAmount > 0 ? (range.total / totalAmount * 100).toFixed(1) : '0.0';
                lines.push([
                    range.label,
                    range.count,
                    range.total.toFixed(2),
                    `${percentage}%`,
                    separator.repeat(3)
                ].join(separator));
            });
            
            lines.push('');
            lines.push('');
            
            // PIE DE PÁGINA
            lines.push('='.repeat(80));
            lines.push(`Documento generado automáticamente${separator}${format(new Date(), 'dd/MM/yyyy HH:mm')}${separator.repeat(4)}`);
            lines.push(`OMENAR SOLUTIONS SL${separator}Sistema de Gestión de Gastos Fijos${separator.repeat(4)}`);
            
            // Crear el contenido CSV
            const csvContent = lines.join('\n');
            
            // BOM UTF-8 para compatibilidad con Excel
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `OMENAR_Gastos_Fijos_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Archivo Excel exportado correctamente con formato mejorado');
        } catch (error) {
            console.error('❌ Error exportando a Excel:', error);
            alert('Error al exportar el archivo. Por favor, inténtalo de nuevo.');
        }
    };

    const exportToPDF = () => {
        try {
            const printWindow = window.open('', '_blank');
            const currentDate = new Date();
            const formattedDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
            const formattedDateTime = format(currentDate, "dd/MM/yyyy 'a las' HH:mm");
            
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Gastos Fijos - ${format(currentDate, 'dd/MM/yyyy')}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 3px solid #2563eb;
                            padding-bottom: 20px;
                        }
                        .header h1 {
                            color: #1e40af;
                            margin: 0 0 10px 0;
                        }
                        .header p {
                            color: #666;
                            margin: 5px 0;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        .stat-card {
                            background: #f3f4f6;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #2563eb;
                        }
                        .stat-card .label {
                            font-size: 12px;
                            color: #666;
                            margin-bottom: 5px;
                        }
                        .stat-card .value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1e40af;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }
                        th {
                            background-color: #2563eb;
                            color: white;
                            padding: 12px;
                            text-align: left;
                            font-weight: 600;
                        }
                        td {
                            padding: 10px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        tr:nth-child(even) {
                            background-color: #f9fafb;
                        }
                        .total-row {
                            background-color: #dbeafe !important;
                            font-weight: bold;
                        }
                        .total-row td {
                            padding: 15px 10px;
                            border-top: 2px solid #2563eb;
                        }
                        .amount {
                            text-align: right;
                            font-weight: 600;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                        }
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>GASTOS FIJOS MENSUALES</h1>
                        <p><strong>OMENAR SOLUTIONS SL</strong></p>
                        <p>Fecha de emisión: ${formattedDate}</p>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="label">Total Gastos Fijos</div>
                            <div class="value">€${stats.totalFixedExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Empleados Operarios</div>
                            <div class="value">${stats.activeOperarios}</div>
                        </div>
                        <div class="stat-card">
                            <div class="label">Coste por Operario</div>
                            <div class="value">€${stats.costPerOperario.toFixed(2)}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 25%">Concepto</th>
                                <th style="width: 30%">Descripción</th>
                                <th style="width: 12%; text-align: right">Base (€)</th>
                                <th style="width: 8%; text-align: right">IVA %</th>
                                <th style="width: 10%; text-align: right">IVA (€)</th>
                                <th style="width: 15%; text-align: right">Total (€)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${expenses.map(exp => `
                                <tr>
                                    <td><strong>${exp.concept || ''}</strong></td>
                                    <td>${exp.description || '-'}</td>
                                    <td class="amount">€${(exp.base_amount || 0).toFixed(2)}</td>
                                    <td class="amount">${(exp.iva_rate || 0).toFixed(0)}%</td>
                                    <td class="amount">€${(exp.iva_amount || 0).toFixed(2)}</td>
                                    <td class="amount"><strong>€${(exp.total_amount || 0).toFixed(2)}</strong></td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2"><strong>TOTAL MENSUAL</strong></td>
                                <td class="amount">€${expenses.reduce((sum, exp) => sum + (exp.base_amount || 0), 0).toFixed(2)}</td>
                                <td></td>
                                <td class="amount">€${expenses.reduce((sum, exp) => sum + (exp.iva_amount || 0), 0).toFixed(2)}</td>
                                <td class="amount"><strong>€${stats.totalFixedExpenses.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        <p><strong>OMENAR SOLUTIONS SL</strong> - Gestión de Gastos Fijos</p>
                        <p>Documento generado automáticamente - ${formattedDateTime}</p>
                    </div>

                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `;
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            console.log('✅ PDF generado correctamente');
        } catch (error) {
            console.error('❌ Error exportando a PDF:', error);
            alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md border-0">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Gastos Fijos Mensuales</CardTitle>
                        <DollarSign className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">€{stats.totalFixedExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-md border-0">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Empleados Operarios Activos</CardTitle>
                        <Users className="w-4 h-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOperarios}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-md border-0 bg-amber-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Coste Fijo / Empleado Operario</CardTitle>
                        <Calculator className="w-4 h-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">€{stats.costPerOperario.toFixed(2)}</div>
                        <p className="text-xs text-amber-700">Repercusión mensual por operario</p>
                    </CardContent>
                </Card>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Cálculo del Coste por Empleado Operario</AlertTitle>
                <AlertDescription>
                    Este valor representa la repercusión de los gastos fijos por cada empleado operativo. Se calcula dividiendo el "Total Gastos Fijos Mensuales" (que incluye IVA) entre el "Número de Empleados Operarios Activos". Los roles considerados como operarios son: {OPERARIO_POSITIONS.join(', ')}.
                </AlertDescription>
            </Alert>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Gastos Fijos</CardTitle>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={exportToExcel}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                                        Descargar Excel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToPDF}>
                                        <FileText className="w-4 h-4 mr-2 text-red-600" />
                                        Descargar PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Button onClick={handleNewExpense}>
                                <Plus className="w-4 h-4 mr-2" />
                                {showForm ? 'Cancelar' : 'Nuevo Gasto Fijo'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {showForm && (
                        <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-semibold">{editingExpense ? 'Editando Gasto Fijo' : 'Nuevo Gasto Fijo'}</h3>
                            <Input 
                                placeholder="Concepto *" 
                                value={newExpense.concept} 
                                onChange={(e) => setNewExpense({...newExpense, concept: e.target.value})} 
                                required
                            />
                            <Input 
                                placeholder="Descripción" 
                                value={newExpense.description} 
                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} 
                            />
                            
                            <div className="space-y-3">
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    placeholder="Importe Total (precio final) *" 
                                    value={newExpense.total_amount} 
                                    onChange={(e) => setNewExpense({...newExpense, total_amount: e.target.value })} 
                                    required
                                    className="text-lg font-semibold"
                                />
                                
                                <div className="flex items-center space-x-2 p-3 bg-white rounded-md border">
                                    <Checkbox 
                                        id="includes_iva" 
                                        checked={newExpense.includes_iva}
                                        onCheckedChange={(checked) => setNewExpense({...newExpense, includes_iva: checked})}
                                    />
                                    <label htmlFor="includes_iva" className="text-sm font-medium cursor-pointer">
                                        Este importe incluye IVA
                                    </label>
                                </div>

                                {newExpense.includes_iva && (
                                    <Input 
                                        type="number" 
                                        step="0.01"
                                        placeholder="IVA (%)" 
                                        value={newExpense.iva_rate} 
                                        onChange={(e) => setNewExpense({...newExpense, iva_rate: e.target.value })} 
                                        className="w-32"
                                    />
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm space-y-1">
                                <div className="font-semibold text-blue-900 mb-2">Desglose:</div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Base Imponible:</span> 
                                    <span className="font-semibold">€{(parseFloat(newExpense.base_amount) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">IVA ({parseFloat(newExpense.iva_rate) || 0}%):</span> 
                                    <span className="font-semibold">€{(parseFloat(newExpense.iva_amount) || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-blue-300 pt-1 mt-1">
                                    <span className="font-bold text-blue-900">Total:</span> 
                                    <span className="font-bold text-blue-900">€{(parseFloat(newExpense.total_amount) || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSave} type="button">Guardar</Button>
                                <Button 
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingExpense(null);
                                        setNewExpense(initialExpenseState);
                                    }} 
                                    variant="outline"
                                    type="button"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Importe Mensual</TableHead>
                                <TableHead>Última Actualización</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        <div className="font-medium">{expense.concept}</div>
                                        <div className="text-sm text-gray-500">{expense.description}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-semibold">€{(expense.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        { (expense.iva_amount || 0) > 0 && 
                                            <div className="text-xs text-gray-500">
                                                (Base: €{(expense.base_amount || 0).toFixed(2)} + IVA ({expense.iva_rate || 0}%): €{(expense.iva_amount || 0).toFixed(2)})
                                            </div>
                                        }
                                    </TableCell>
                                    <TableCell>{format(new Date(expense.updated_date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
