import React from 'react';
import { format } from 'date-fns';

const PrintLayout = ({ title, children, preparedBy, orientation = "portrait" }) => {
    return (
        <div className="print-layout-container" style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: '#333',
            background: 'white',
            padding: '20px', // standard padding
            width: '100%',
        }}>
            <style>
                {`
                    @page {
                        size: A4 ${orientation};
                        margin: 10mm;
                    }
                    @media print {
                        body { 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact;
                        }
                        .no-print { display: none !important; }
                    }
                    .table-print {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                        margin-top: 15px;
                    }
                    .table-print th, .table-print td {
                        border: 1px solid #000;
                        padding: 8px 10px;
                        color: #212529;
                    }
                    .table-print th {
                        background-color: #f8f9fa !important;
                        font-weight: 600;
                        text-align: left;
                    }
                    .print-header {
                        border-bottom: 2px solid #0d6efd;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: 800;
                        color: #0d6efd;
                        letter-spacing: -0.5px;
                        margin-bottom: 5px;
                        text-transform: uppercase;
                    }
                    .report-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #212529;
                        margin: 0;
                    }
                    .meta-info {
                        font-size: 11px;
                        color: #6c757d;
                        text-align: right;
                    }
                    .print-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        border-top: 1px solid #dee2e6;
                        padding-top: 10px;
                        font-size: 10px;
                        color: #adb5bd;
                        display: flex;
                        justify-content: space-between;
                        background: white;
                    }
                `}
            </style>

            <div className="print-header">
                <div>
                    <div className="company-name">Arak & Legend Dental Lab</div>
                    <h2 className="report-title">{title}</h2>
                </div>
                <div className="meta-info">
                    <div>Generated: {format(new Date(), "PPpp")}</div>
                    {preparedBy && <div>Prepared By: <strong>{preparedBy}</strong></div>}
                </div>
            </div>

            <main>
                {children}
            </main>

            <div className="print-footer">
                <div>Confidential Report - For Internal Use Only</div>
                <div>Page <span className="page-number">1 / 1</span></div>
            </div>
        </div>
    );
};

export default PrintLayout;
