import React from 'react';
import PrintLayout from '../../Common/PrintLayout';
import { format } from 'date-fns';

export const DoctorCasesReport = React.forwardRef(({ doctor, cases }, ref) => {
    // Calculate simple stats
    const totalCases = cases.length;
    const finishedCases = cases.filter(c => c.delivering?.status?.isEnd).length;
    const activeCases = totalCases - finishedCases;

    return (
        <div ref={ref}>
            <PrintLayout
                title={`Doctor Case Report`}
                preparedBy="System"
            >
                {/* Doctor Info Block */}
                <div style={{
                    marginBottom: '20px',
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#0d6efd' }}>
                            Dr. {doctor?.firstName} {doctor?.lastName}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#495057' }}>
                            <div><strong>Clinic:</strong> {doctor?.clinicName || 'N/A'}</div>
                            <div><strong>Address:</strong> {doctor?.address?.city || 'N/A'}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', marginBottom: '5px' }}>Summary</div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalCases}</div>
                                <div style={{ fontSize: '11px', color: '#6c757d' }}>Total</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#198754' }}>{finishedCases}</div>
                                <div style={{ fontSize: '11px', color: '#6c757d' }}>Finished</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{activeCases}</div>
                                <div style={{ fontSize: '11px', color: '#6c757d' }}>Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                <table className="table-print">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Case #</th>
                            <th style={{ width: '20%' }}>Patient</th>
                            <th style={{ width: '15%' }}>In Date</th>
                            <th style={{ width: '15%' }}>Due Date</th>
                            <th style={{ width: '40%' }}>Work Type</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((item) => (
                            <tr key={item._id}>
                                <td>
                                    <strong>{item.caseNumber}</strong>
                                    {item.isHold && <span style={{ color: '#dc3545', marginLeft: '5px', fontSize: '10px' }}>(HOLD)</span>}
                                </td>
                                <td>{item.patientName}</td>
                                <td>{format(new Date(item.dateIn), 'dd/MM/yyyy')}</td>
                                <td>{item.dateOut ? format(new Date(item.dateOut), 'dd/MM/yyyy') : '-'}</td>
                                <td>{item.caseType || item.workType || 'General'}</td>
                                <td style={{ textAlign: 'center' }}>{item.teethNumbers?.length || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </PrintLayout>
        </div>
    );
});

export default DoctorCasesReport;
