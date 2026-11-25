import React from 'react';
import PrintLayout from '../../Common/PrintLayout';
import { format } from 'date-fns';

export const AssignedDoctorsListReport = React.forwardRef(({ assignments, viewingUser, printData = {} }, ref) => {
    // Filter assignments based on selection if printData exists, otherwise show all
    const selectedAssignments = assignments.filter(item =>
        !printData[item.doctorId._id] || printData[item.doctorId._id].selected !== false
    );

    return (
        <div ref={ref}>
            <PrintLayout
                title="Assigned Doctors Payment Report"
                preparedBy={viewingUser ? `${viewingUser.firstName} ${viewingUser.lastName}` : 'System'}
            >
                <div style={{ marginBottom: '20px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        background: '#f8f9fa',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div>
                            <span style={{ color: '#6c757d', fontSize: '12px', display: 'block' }}>Total Doctors</span>
                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedAssignments.length}</span>
                        </div>
                        <div>
                            {/* Placeholders for summary stats if needed */}
                        </div>
                    </div>
                </div>

                <table className="table-print">
                    <thead>
                        <tr>
                            <th style={{ width: '5%' }}>#</th>
                            <th style={{ width: '20%' }}>Doctor Name</th>
                            <th style={{ width: '15%' }}>Clinic</th>
                            <th style={{ width: '15%' }}>Phone</th>
                            <th style={{ width: '10%' }}>Assigned</th>
                            <th style={{ width: '10%', textAlign: 'right' }}>Paid</th>
                            <th style={{ width: '15%' }}>Date</th>
                            <th style={{ width: '10%', textAlign: 'right' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedAssignments.map((item, index) => {
                            const data = printData[item.doctorId._id] || {};
                            return (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <strong>{item.doctorId.firstName} {item.doctorId.lastName}</strong>
                                    </td>
                                    <td>{item.doctorId.clinicName || '-'}</td>
                                    <td>{item.doctorId.phone || '-'}</td>
                                    <td>{format(new Date(item.assignedAt), "MMM dd, yyyy")}</td>
                                    <td style={{ textAlign: 'right' }}>{data.paid || ''}</td>
                                    <td>{data.paymentDate || ''}</td>
                                    <td style={{ textAlign: 'right' }}>{data.balance || ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                            <td colSpan="5" style={{ textAlign: 'right' }}>TOTAL:</td>
                            <td style={{ textAlign: 'right' }}></td>
                            <td></td>
                            <td style={{ textAlign: 'right' }}></td>
                        </tr>
                    </tfoot>
                </table>

                <div style={{ marginTop: '30px', fontSize: '12px', color: '#6c757d', fontStyle: 'italic' }}>
                    * This document is generated for payment tracking purposes.
                </div>
            </PrintLayout>
        </div>
    );
});

export default AssignedDoctorsListReport;
