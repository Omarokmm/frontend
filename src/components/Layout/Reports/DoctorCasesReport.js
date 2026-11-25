import React from 'react';
import PrintLayout from '../../Common/PrintLayout';
import { format } from 'date-fns';

export const DoctorCasesReport = React.forwardRef(({ doctor, cases = [] }, ref) => {
    // Calculate total cases
    const totalCases = cases.length;

    // Calculate tooth pieces metrics
    const totalPieces = cases.reduce((sum, c) => sum + (c.teethNumbers?.length || 0), 0);
    const studyPieces = cases.reduce((sum, c) => sum + (c.teethNumbers?.filter(t => t.name === 'Study').length || 0), 0);
    const withoutStudyPieces = totalPieces - studyPieces;

    // Calculate material breakdown
    const materialCounts = {};
    cases.forEach(c => {
        (c.teethNumbers || []).forEach(t => {
            if (t.name) {
                materialCounts[t.name] = (materialCounts[t.name] || 0) + 1;
            }
        });
    });
    const materialList = Object.entries(materialCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return (
        <div ref={ref}>
            <PrintLayout
                title="Doctor Cases & Statistics Report"
                preparedBy="System"
            >
                {/* Doctor Info & Total Cases Header */}
                <div style={{
                    marginBottom: '15px',
                    padding: '15px 20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', color: '#0d6efd', fontSize: '20px', fontWeight: 'bold' }}>
                            Dr. {doctor?.firstName} {doctor?.lastName}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#495057', display: 'flex', gap: '15px' }}>
                            <span><strong>Clinic:</strong> {doctor?.clinicName || 'N/A'}</span>
                            <span><strong>Location:</strong> {doctor?.address?.city || doctor?.address?.country || 'N/A'}</span>
                            <span><strong>Phone:</strong> {doctor?.phone || 'N/A'}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ background: '#ffffff', padding: '8px 16px', borderRadius: '6px', border: '1px solid #dee2e6', display: 'inline-block', textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d6efd' }}>{totalCases}</div>
                            <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase' }}>Total Cases</div>
                        </div>
                    </div>
                </div>

                {/* Statistics Summary Section (Units & Materials) */}
                <div style={{
                    marginBottom: '20px',
                    padding: '12px 16px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0d6efd', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📊 Units & Material Statistics Summary
                    </div>

                    {/* Unit Totals Row */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                        <div style={{ flex: 1, background: '#f0f7ff', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #0d6efd' }}>
                            <span style={{ fontSize: '11px', color: '#495057', display: 'block', fontWeight: '500' }}>Total Tooth Pieces / Units</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d6efd' }}>{totalPieces}</span>
                        </div>
                        <div style={{ flex: 1, background: '#e0f2fe', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
                            <span style={{ fontSize: '11px', color: '#495057', display: 'block', fontWeight: '500' }}>Pieces Without Study</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0284c7' }}>{withoutStudyPieces}</span>
                        </div>
                        <div style={{ flex: 1, background: '#dcfce7', padding: '8px 12px', borderRadius: '6px', borderLeft: '4px solid #16a34a' }}>
                            <span style={{ fontSize: '11px', color: '#495057', display: 'block', fontWeight: '500' }}>Study Cases / Units</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>{studyPieces}</span>
                        </div>
                    </div>

                    {/* Material Breakdown Chips / Grid */}
                    {materialList.length > 0 && (
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d', marginBottom: '6px' }}>
                                Material Breakdown:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {materialList.map(({ name, count }) => {
                                    const percentage = totalPieces > 0 ? ((count / totalPieces) * 100).toFixed(1) : 0;
                                    return (
                                        <div key={name} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: '#f8f9fa',
                                            border: '1px solid #ced4da',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '11px'
                                        }}>
                                            <span style={{ fontWeight: '600', color: '#212529' }}>{name}:</span>
                                            <span style={{
                                                background: '#0d6efd',
                                                color: 'white',
                                                borderRadius: '10px',
                                                padding: '1px 7px',
                                                fontWeight: 'bold',
                                                fontSize: '11px'
                                            }}>
                                                {count}
                                            </span>
                                            <span style={{ color: '#6c757d', fontSize: '10px' }}>({percentage}%)</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cases Table */}
                <table className="table-print">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Case #</th>
                            <th style={{ width: '25%' }}>Patient</th>
                            <th style={{ width: '15%' }}>In Date</th>
                            <th style={{ width: '15%' }}>Due Date</th>
                            <th style={{ width: '20%' }}>Work Type</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.length > 0 ? (
                            cases.map((item) => {
                                const delivDateEnd = item.delivering?.actions?.find(i => i.dateEnd)?.dateEnd ||
                                                     item.delivering?.actions?.[item.delivering?.actions?.length - 1]?.dateEnd;
                                const endDateDisplay = delivDateEnd
                                    ? format(new Date(delivDateEnd), 'dd/MM/yyyy')
                                    : (item.dateOut ? format(new Date(item.dateOut), 'dd/MM/yyyy') : '-');

                                return (
                                    <tr key={item._id}>
                                        <td>
                                            <strong>{item.caseNumber}</strong>
                                        </td>
                                        <td>{item.patientName}</td>
                                        <td>{item.dateIn ? format(new Date(item.dateIn), 'dd/MM/yyyy') : '-'}</td>
                                        <td>{endDateDisplay}</td>
                                        <td>{item.caseType || item.workType || 'General'}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.teethNumbers?.length || 0}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', color: '#6c757d', padding: '15px' }}>
                                    No cases found for this doctor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                            <td colSpan="5" style={{ textAlign: 'right' }}>Total Units / Pieces:</td>
                            <td style={{ textAlign: 'center', color: '#0d6efd', fontSize: '13px' }}>{totalPieces}</td>
                        </tr>
                    </tfoot>
                </table>
            </PrintLayout>
        </div>
    );
});

export default DoctorCasesReport;
