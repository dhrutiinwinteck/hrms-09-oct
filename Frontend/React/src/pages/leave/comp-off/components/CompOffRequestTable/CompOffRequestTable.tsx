import {



  Check,



  ChevronLeft,



  ChevronRight,



  Eye,



  FileText,



  X,



} from 'lucide-react';







import type {



  CompOffRequest,



} from '../../types/compOff.types';







import {



  formatCompOffDate,



  getDayTypeLabel,



  getStatusClass,



  getStatusLabel,



} from '../../utils/compOff.utils';







interface CompOffRequestTableProps {



  requests: CompOffRequest[];



  currentPage: number;



  totalPages: number;



  totalFiltered: number;



  onPageChange: (page: number) => void;



  onView: (



    request: CompOffRequest,



  ) => void;







  /**



   * Only Human Resource users



   * should see the Actions column.



   */



  isHR: boolean;







  /**



   * Called when HR clicks Accept.



   */



  onApprove: (



    request: CompOffRequest,



  ) => void;







  /**



   * Called when HR clicks Reject.



   */



  onReject: (



    request: CompOffRequest,



  ) => void;



}







const PAGE_SIZE = 8;







const CompOffRequestTable = ({



  requests,



  currentPage,



  totalPages,



  totalFiltered,



  onPageChange,



  onView,



  isHR,



  onApprove,



  onReject,



}: CompOffRequestTableProps) => {



  const showingFrom =



    totalFiltered === 0



      ? 0



      : (currentPage - 1) * PAGE_SIZE + 1;







  const showingTo = Math.min(



    currentPage * PAGE_SIZE,



    totalFiltered,



  );







  return (



    <div className="comp-off-table-card">



      {/* ==================================================



          TABLE HEADER



      ================================================== */}



      <div className="comp-off-table-title">



        <h2>Comp Off Requests</h2>



      </div>







      {/* ==================================================



          TABLE



      ================================================== */}



      <div className="comp-off-table-wrapper">



        <table className="comp-off-table">



          <thead>



            <tr>



              <th>#</th>



              {isHR && (

                <>

                  <th>Employee</th>

                  <th>Employee Code</th>

                </>

              )}



              <th>Worked Date</th>



              <th>Day Type</th>



              <th>Comp Off Date</th>



              <th>Requested On</th>



              <th>Reason</th>



              <th>Status</th>



              {isHR && <th>Actions</th>}



            </tr>



          </thead>







          <tbody>



            {requests.length === 0 ? (



              <tr>



                <td



                  colSpan={isHR ? 10 : 7}



                  className="comp-off-empty"



                >



                  <FileText size={30} />







                  <span>



                    No Comp Off requests found.



                  </span>



                </td>



              </tr>



            ) : (



              requests.map(



                (request, index) => (



                  <tr



                    key={



                      request.requestId



                    }



                  >



                    {/* ======================================



                        SERIAL NUMBER



                    ====================================== */}



                    <td>



                      {(currentPage - 1) *



                        PAGE_SIZE +



                        index +



                        1}



                    </td>



                    {isHR && (

                      <>

                        <td>

                          <div className="comp-off-employee-cell">

                            <strong>{request.employeeName || '-'}</strong>

                          </div>

                        </td>

                        <td>

                          <span className="comp-off-employee-code">

                            {request.employeeCode || '-'}

                          </span>

                        </td>

                      </>

                    )}







                    {/* ======================================



                        WORKED DATE



                    ====================================== */}



                    <td>



                      {formatCompOffDate(



                        request.workedDate,



                      )}



                    </td>







                    {/* ======================================



                        DAY TYPE



                    ====================================== */}



                    <td>



                      <span



                        className={`comp-off-day-badge ${



                          request.dayType ===



                          'PUBLIC_HOLIDAY'



                            ? 'holiday'



                            : 'weekoff'



                        }`}



                      >



                        {getDayTypeLabel(



                          request.dayType,



                        )}



                      </span>



                    </td>







                    {/* ======================================



                        REASON



                    ====================================== */}



                    <td



                      className="reason-cell"



                      title={



                        request.reason



                      }



                    >



                      {request.reason}



                    </td>







                    {/* ======================================



                        REQUESTED ON



                    ====================================== */}



                    <td>



                      {formatCompOffDate(



                        request.requestedOn,



                      )}



                    </td>







                    {/* ======================================



                        COMP OFF DATE



                    ====================================== */}



                    <td>



                      {formatCompOffDate(



                        request.compOffDate,



                      )}



                    </td>







                    {/* ======================================



                        STATUS



                    ====================================== */}



                    <td>



                      <span



                        className={`comp-off-status-badge ${getStatusClass(



                          request.status,



                        )}`}



                      >



                        <span />







                        {getStatusLabel(



                          request.status,



                        )}



                      </span>



                    </td>







                    {/* ======================================



                        HR ACTIONS ONLY



                    ====================================== */}



                    {isHR && (



                      <td>



                        <div className="comp-off-row-actions">



                          {/* VIEW */}



                          <button



                            type="button"



                            title="View"



                            aria-label="View Comp Off request"



                            onClick={() =>



                              onView(



                                request,



                              )



                            }



                          >



                            <Eye



                              size={16}



                            />



                          </button>







                          {/* APPROVE / REJECT



                              Only pending requests */}



                          {request.status ===



                            'PENDING' && (



                            <>



                              {/* APPROVE */}



                              <button



                                type="button"



                                title="Accept Comp Off"



                                aria-label="Accept Comp Off request"



                                className="comp-off-action-approve"



                                onClick={() =>



                                  onApprove(



                                    request,



                                  )



                                }



                              >



                                <Check



                                  size={15}



                                />



                              </button>







                              {/* REJECT */}



                              <button



                                type="button"



                                title="Reject Comp Off"



                                aria-label="Reject Comp Off request"



                                className="comp-off-action-reject"



                                onClick={() =>



                                  onReject(



                                    request,



                                  )



                                }



                              >



                                <X



                                  size={15}



                                />



                              </button>



                            </>



                          )}



                        </div>



                      </td>



                    )}



                  </tr>



                ),



              )



            )}



          </tbody>



        </table>



      </div>







      {/* ==================================================



          PAGINATION



      ================================================== */}



      <div className="comp-off-pagination">



        <span>



          Showing {showingFrom}–



          {showingTo} of{' '}



          {totalFiltered} requests



        </span>







        <div className="pagination-controls">



          {/* PREVIOUS */}



          <button



            type="button"



            disabled={



              currentPage === 1



            }



            onClick={() =>



              onPageChange(



                Math.max(



                  1,



                  currentPage - 1,



                ),



              )



            }



          >



            <ChevronLeft



              size={16}



            />



          </button>







          {/* PAGE NUMBERS */}



          {Array.from(



            {



              length: totalPages,



            },



            (_, index) =>



              index + 1,



          )



            .slice(



              Math.max(



                0,



                currentPage - 2,



              ),



              Math.max(



                3,



                currentPage + 1,



              ),



            )



            .map((page) => (



              <button



                type="button"



                key={page}



                className={



                  page ===



                  currentPage



                    ? 'active'



                    : ''



                }



                onClick={() =>



                  onPageChange(



                    page,



                  )



                }



              >



                {page}



              </button>



            ))}







          {/* NEXT */}



          <button



            type="button"



            disabled={



              currentPage ===



              totalPages



            }



            onClick={() =>



              onPageChange(



                Math.min(



                  totalPages,



                  currentPage + 1,



                ),



              )



            }



          >



            <ChevronRight



              size={16}



            />



          </button>



        </div>



      </div>



    </div>



  );



};







export default CompOffRequestTable;