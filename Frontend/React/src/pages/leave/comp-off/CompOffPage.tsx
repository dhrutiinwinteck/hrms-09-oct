import {



  type ChangeEvent,



  type FormEvent,



  useState,



} from 'react';







import {



  CalendarDays,



  Check,



  CheckCircle2,



  Clock3,



  Eye,



  Plus,



  Search,



  X,



} from 'lucide-react';







import './CompOffPage.css';







import useCompOff from './hooks/useCompOff';







import type {






  CompOffDayType,



  CompOffRequest,



  CompOffStatus,



  CreateCompOffRequest,






} from './types/compOff.types';







/* ============================================================



   CONSTANTS



\\============================================================ */







const PAGE_SIZE = 8;







const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;







const ALLOWED_ATTACHMENT_EXTENSIONS = [



  '.pdf',



  '.jpg',



  '.jpeg',



  '.png',



] as const;







type DayType = CompOffDayType;







/* ============================================================



   FORM STATE



\\============================================================ */







interface CompOffFormState {



  workedDate: string;



  dayType: DayType;



  reason: string;



  attachment?: File;



}







const INITIAL_FORM: CompOffFormState = {



  workedDate: '',



  dayType: 'PUBLIC_HOLIDAY',



  reason: '',



  attachment: undefined,



};







/* ============================================================



   PAGE



\\============================================================ */







const CompOffPage = () => {



  const {



    summary,



    filters,



    updateFilters,



    resetFilters,



    paginatedRequests,



    filteredRequests,



    currentPage,



    totalPages,



    setCurrentPage,



    loading,



    submitting,



    error,



    submitRequest,



    approveRequest,

    rejectRequest,







    // HR ROLE INFORMATION



    isHR,



    roleLoading,



  } = useCompOff();







  /* ==========================================================



     MODAL



  ========================================================== */







  const [modalOpen, setModalOpen] =



    useState<boolean>(false);







  /* ==========================================================



     FORM



  ========================================================== */







  const [form, setForm] =



    useState<CompOffFormState>(



      INITIAL_FORM,



    );







  const [formError, setFormError] =



    useState<string>('');



  const [selectedRequest, setSelectedRequest] = useState<CompOffRequest | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  const [actionError, setActionError] = useState('');







  /* ==========================================================



     OPEN ADD MODAL



  ========================================================== */







  const openAddModal = (): void => {



    setForm({



      ...INITIAL_FORM,



    });







    setFormError('');







    setModalOpen(true);



  };







  /* ==========================================================



     CLOSE MODAL



  ========================================================== */







  const closeModal = (): void => {



    if (submitting) {



      return;



    }







    setModalOpen(false);







    setForm({



      ...INITIAL_FORM,



    });







    setFormError('');



  };







  /* ==========================================================



     FORM CHANGE



  ========================================================== */







  const handleFormChange = (



    field: keyof CompOffFormState,



    value:



      | string



      | File



      | undefined,



  ): void => {



    setForm((previous) => ({



      ...previous,



      [field]: value,



    }));



  };







  /* ==========================================================



     ATTACHMENT CHANGE



  ========================================================== */







  const handleAttachmentChange = (



    event: ChangeEvent<HTMLInputElement>,



  ): void => {



    const file =



      event.target.files?.[0];







    if (!file) {



      handleFormChange(



        'attachment',



        undefined,



      );







      return;



    }







    /* --------------------------------------------------------



       Validate extension



    -------------------------------------------------------- */







    const extension =



      `.${file.name



        .split('.')



        .pop()



        ?.toLowerCase() ?? ''}`;







    const isAllowedExtension =



      ALLOWED_ATTACHMENT_EXTENSIONS.some(



        (allowedExtension) =>



          allowedExtension === extension,



      );







    if (!isAllowedExtension) {



      setFormError(



        'Only PDF, JPG, JPEG and PNG files are allowed.',



      );







      event.target.value = '';







      handleFormChange(



        'attachment',



        undefined,



      );







      return;



    }







    /* --------------------------------------------------------



       Validate size



    -------------------------------------------------------- */







    if (



      file.size >



      MAX_ATTACHMENT_SIZE



    ) {



      setFormError(



        'Attachment size cannot exceed 5 MB.',



      );







      event.target.value = '';







      handleFormChange(



        'attachment',



        undefined,



      );







      return;



    }







    setFormError('');







    handleFormChange(



      'attachment',



      file,



    );



  };







  /* ==========================================================



     SUBMIT



  ========================================================== */







  const handleSubmit = async (



    event: FormEvent<HTMLFormElement>,



  ): Promise<void> => {



    event.preventDefault();







    setFormError('');







    /* --------------------------------------------------------



       Worked date



    -------------------------------------------------------- */







    if (!form.workedDate) {



      setFormError(



        'Please select the date you worked.',



      );







      return;



    }







    /* --------------------------------------------------------



       Day type



    -------------------------------------------------------- */







    if (!form.dayType) {



      setFormError(



        'Please select the day type.',



      );







      return;



    }







    /* --------------------------------------------------------



       Reason



    -------------------------------------------------------- */







    const trimmedReason =



      form.reason.trim();







    if (!trimmedReason) {



      setFormError(



        'Please enter the reason or remarks.',



      );







      return;



    }







    if (trimmedReason.length > 500) {



      setFormError(



        'Reason or remarks cannot exceed 500 characters.',



      );







      return;



    }







    /* --------------------------------------------------------



       Validate date



    -------------------------------------------------------- */







    const selectedDate = new Date(



      `${form.workedDate}T00:00:00`,



    );







    const today = new Date();







    today.setHours(



      0,



      0,



      0,



      0,



    );







    if (



      Number.isNaN(



        selectedDate.getTime(),



      )



    ) {



      setFormError(



        'Please select a valid worked date.',



      );







      return;



    }







    if (selectedDate > today) {



      setFormError(



        'Worked date cannot be a future date.',



      );







      return;



    }







    /* --------------------------------------------------------



       Create payload



    -------------------------------------------------------- */







    const payload: CreateCompOffRequest = {



      workedDate:



        form.workedDate,







      dayType:



        form.dayType,







      reason:



        trimmedReason,







      attachment:



        form.attachment ?? null,



    };







    try {



      await submitRequest(



        payload,



      );







      setModalOpen(false);







      setForm({



        ...INITIAL_FORM,



      });







      setFormError('');



    } catch (submitError) {



      setFormError(



        submitError instanceof Error



          ? submitError.message



          : 'Unable to submit Comp Off request.',



      );



    }



  };







  /* ==========================================================



     HR REQUEST ACTIONS



  ========================================================== */



  const handleViewRequest = (request: CompOffRequest): void => {

    setSelectedRequest(request);

    setActionError('');

    setDetailsOpen(true);

  };



  const handleApproveClick = (request: CompOffRequest): void => {
    setSelectedRequest(request);
    setActionError('');
    setApproveOpen(true);
  };



  const handleRejectClick = (request: CompOffRequest): void => {

    setSelectedRequest(request);

    setRejectionReason(request.rejectionReason ?? '');

    setActionError('');

    setRejectOpen(true);

  };



  const handleApproveSubmit = async (): Promise<void> => {
    if (!selectedRequest) return;

    try {
      await approveRequest(selectedRequest.requestId);
      setApproveOpen(false);
      setSelectedRequest(null);
      setActionError('');
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to approve Comp Off request.',
      );
    }
  };

  const handleRejectSubmit = async (): Promise<void> => {

    if (!selectedRequest) return;

    const reason = rejectionReason.trim();

    if (!reason) { setActionError('Rejection reason is required.'); return; }

    try {

      await rejectRequest(selectedRequest.requestId, reason);

      setRejectOpen(false); setSelectedRequest(null); setRejectionReason(''); setActionError('');

    } catch (requestError) {

      setActionError(requestError instanceof Error ? requestError.message : 'Unable to reject Comp Off request.');

    }

  };



  const closeActionModals = (): void => {

    if (submitting) return;

    setDetailsOpen(false); setApproveOpen(false); setRejectOpen(false); setSelectedRequest(null); setActionError('');

  };



  /* ==========================================================



     SEARCH



  ========================================================== */







  const handleSearchChange = (



    value: string,



  ): void => {



    updateFilters({



      search: value,



    });



  };







  /* ==========================================================



     DAY TYPE FILTER



  ========================================================== */







  const handleDayTypeChange = (



    value: string,



  ): void => {



    updateFilters({



      dayType:



        value === 'ALL'



          ? 'ALL'



          : (value as CompOffDayType),



    });



  };







  /* ==========================================================



     STATUS FILTER



  ========================================================== */







  const handleStatusChange = (



    value: string,



  ): void => {



    updateFilters({



      status:



        value === 'ALL'



          ? 'ALL'



          : (value as CompOffStatus),



    });



  };







  /* ==========================================================



     STATUS CLASS



  ========================================================== */







  const getStatusClass = (



    status: unknown,



  ): string => {



    const normalizedStatus =



      String(status ?? '')



        .trim()



        .toUpperCase();







    if (



      normalizedStatus ===



      'APPROVED'



    ) {



      return 'approved';



    }







    if (



      normalizedStatus ===



        'PENDING' ||



      normalizedStatus ===



        'APPLIED'



    ) {



      return 'pending';



    }







    if (



      normalizedStatus ===



      'REJECTED'



    ) {



      return 'rejected';



    }







    return 'pending';



  };







  /* ==========================================================



     STATUS LABEL



  ========================================================== */







  const getStatusLabel = (



    status: unknown,



  ): string => {



    const normalizedStatus =



      String(status ?? '')



        .trim()



        .toUpperCase();







    switch (normalizedStatus) {



      case 'APPROVED':



        return 'Approved';







      case 'REJECTED':



        return 'Rejected';







      case 'APPLIED':



        return 'Pending';







      case 'PENDING':



        return 'Pending';







      default:



        return (



          normalizedStatus || '-'



        );



    }



  };







  /* ==========================================================



     DAY TYPE LABEL



  ========================================================== */







  const getDayTypeLabel = (



    dayType: unknown,



  ): string => {



    switch (dayType) {



      case 'PUBLIC_HOLIDAY':



        return 'Public Holiday';







      case 'WEEK_OFF':



        return 'Week Off';







      default:



        return String(



          dayType ?? '-',



        );



    }



  };







  /* ==========================================================



     DATE FORMATTER



  ========================================================== */







  const formatDate = (



    value?: string | null,



  ): string => {



    if (!value) {



      return '-';



    }







    const datePart =



      value.substring(0, 10);







    const date = new Date(



      `${datePart}T00:00:00`,



    );







    if (



      Number.isNaN(



        date.getTime(),



      )



    ) {



      return value;



    }







    return new Intl.DateTimeFormat(



      'en-IN',



      {



        day: '2-digit',



        month: 'short',



        year: 'numeric',



      },



    ).format(date);



  };







  /* ==========================================================



     TODAY - LOCAL DATE



  ========================================================== */







  const getTodayDate = (): string => {



    const today = new Date();







    const year =



      today.getFullYear();







    const month =



      String(



        today.getMonth() + 1,



      ).padStart(2, '0');







    const day =



      String(



        today.getDate(),



      ).padStart(2, '0');







    return `${year}-${month}-${day}`;



  };







  /* ==========================================================



     HR TABLE COLUMN COUNT



  ========================================================== */







  const tableColumnCount = isHR



    ? 10



    : 7;







  /* ==========================================================



     RENDER



  ========================================================== */







  return (



    <div className="comp-off-page">







      {/* ======================================================



          HEADER



      ====================================================== */}







      <div className="comp-off-header">







        <div>







          <div className="comp-off-breadcrumb">







            <span>



              Home



            </span>







            <span>



              /



            </span>







            <span>



              Leave



            </span>







            <span>



              /



            </span>







            <strong>



              {isHR



                ? 'Comp Off Management'



                : 'My Comp Off'}



            </strong>







          </div>







          <h1>



            {isHR



              ? 'Comp Off Management'



              : 'My Comp Off'}



          </h1>







          <p>



            {isHR



              ? 'Review and manage Comp Off requests submitted by employees.'



              : 'View and submit your compensatory off requests for holidays or week offs.'}



          </p>







        </div>







        <div className="comp-off-header-actions">







          {/* --------------------------------------------------



              EMPLOYEE ONLY



              HR is a management user and does not need the



              employee submission button here.



          -------------------------------------------------- */}







          {!isHR && (



            <button



              type="button"



              className="comp-off-add-button"



              onClick={openAddModal}



              disabled={



                submitting ||



                roleLoading



              }



            >



              <Plus size={17} />







              Add Comp Off



            </button>



          )}







        </div>







      </div>







      {/* ======================================================



          SUMMARY



      ====================================================== */}







      <div className="comp-off-stat-grid">







        {/* TOTAL */}







        <div className="comp-off-stat-card">







          <div className="comp-off-stat-icon employees">



            <CalendarDays



              size={19}



            />



          </div>







          <div>







            <span>



              Total Requests



            </span>







            <strong>



              {summary.totalRequests}



            </strong>







          </div>







        </div>







        {/* PENDING */}







        <div className="comp-off-stat-card">







          <div className="comp-off-stat-icon pending">



            <Clock3



              size={19}



            />



          </div>







          <div>







            <span>



              Pending



            </span>







            <strong>



              {summary.pending}



            </strong>







          </div>







        </div>







        {/* APPROVED */}







        <div className="comp-off-stat-card">







          <div className="comp-off-stat-icon assigned">



            <CheckCircle2



              size={19}



            />



          </div>







          <div>







            <span>



              Approved



            </span>







            <strong>



              {summary.approved}



            </strong>







          </div>







        </div>







        {/* REJECTED */}







        <div className="comp-off-stat-card">







          <div className="comp-off-stat-icon holiday">



            <CalendarDays



              size={19}



            />



          </div>







          <div>







            <span>



              Rejected



            </span>







            <strong>



              {summary.rejected}



            </strong>







          </div>







        </div>







      </div>







      {/* ======================================================



          CONTENT



      ====================================================== */}







      <section className="comp-off-content-card">







        <div className="comp-off-section-header">







          <div>







            <h2>



              {isHR



                ? 'Employee Comp Off Requests'



                : 'My Comp Off Requests'}



            </h2>







            <p>



              {isHR



                ? 'View Comp Off requests submitted by all employees.'



                : 'View your submitted Comp Off requests and their current status.'}



            </p>







          </div>







        </div>







        {/* ====================================================



            FILTERS



        ==================================================== */}







        <div className="comp-off-filter-bar">







          {/* SEARCH */}







          <div className="comp-off-search">







            <Search



              size={16}



            />







            <input



              type="text"



              value={



                filters.search



              }



              placeholder={



                isHR



                  ? 'Search employee, code, reason, date or status...'



                  : 'Search reason, date or status...'



              }



              onChange={(event) =>



                handleSearchChange(



                  event.target.value,



                )



              }



            />







          </div>







          {/* DAY TYPE */}







          <select



            value={



              filters.dayType



            }



            onChange={(event) =>



              handleDayTypeChange(



                event.target.value,



              )



            }



          >



            <option value="ALL">



              All Day Types



            </option>







            <option value="PUBLIC_HOLIDAY">



              Public Holiday



            </option>







            <option value="WEEK_OFF">



              Week Off



            </option>







          </select>







          {/* STATUS */}







          <select



            value={



              filters.status



            }



            onChange={(event) =>



              handleStatusChange(



                event.target.value,



              )



            }



          >



            <option value="ALL">



              All Status



            </option>







            <option value="PENDING">



              Pending



            </option>







            <option value="APPLIED">



              Applied



            </option>







            <option value="APPROVED">



              Approved



            </option>







            <option value="REJECTED">



              Rejected



            </option>







          </select>







          {/* CLEAR */}







          {(filters.search ||



            filters.dayType !==



              'ALL' ||



            filters.status !==



              'ALL' ||



            filters.fromDate ||



            filters.toDate) && (



            <button



              type="button"



              className="comp-off-clear-filter"



              onClick={



                resetFilters



              }



            >



              Clear



            </button>



          )}







        </div>







        {/* ====================================================



            API ERROR



        ==================================================== */}







        {error && (



          <div className="comp-off-error">



            {error}



          </div>



        )}







        {/* ====================================================



            TABLE



        ==================================================== */}







        <div className="comp-off-table-wrapper">







          <table className="comp-off-table">







            <thead>







              <tr>







                <th>



                  #



                </th>







                {/* ------------------------------------------------



                    HR ONLY



                ------------------------------------------------ */}







                {isHR && (



                  <>



                    <th>



                      Employee



                    </th>







                    <th>



                      Employee Code



                    </th>



                  </>



                )}







                <th>



                  Worked Date



                </th>







                <th>



                  Day Type



                </th>







                <th>



                  Comp Off Date



                </th>







                <th>



                  Requested On



                </th>







                <th>



                  Reason



                </th>







                <th>



                  Status



                </th>



                {isHR && (

                  <th>Actions</th>

                )}

</tr>







            </thead>







            <tbody>







              {/* ==================================================



                  ROLE LOADING



              ================================================== */}







              {roleLoading ? (







                <tr>







                  <td



                    colSpan={



                      tableColumnCount



                    }



                    className="comp-off-empty"



                  >



                    Loading Comp Off access...



                  </td>







                </tr>







              ) : loading ? (







                <tr>







                  <td



                    colSpan={



                      tableColumnCount



                    }



                    className="comp-off-empty"



                  >



                    {isHR



                      ? 'Loading employee Comp Off requests...'



                      : 'Loading your Comp Off requests...'}



                  </td>







                </tr>







              ) : paginatedRequests.length ===



                0 ? (







                /* ==================================================



                   EMPTY



                ================================================== */







                <tr>







                  <td



                    colSpan={



                      tableColumnCount



                    }



                    className="comp-off-empty"



                  >







                    <div className="comp-off-empty-content">







                      <div className="employee-avatar">







                        <Search



                          size={17}



                        />







                      </div>







                      <strong>



                        No Comp Off requests



                        found



                      </strong>







                      <span>



                        {filteredRequests.length ===



                        0



                          ? isHR



                            ? 'No employee Comp Off requests match the selected filters.'



                            : 'You have not submitted any request matching the selected filters.'



                          : 'No records are available on this page.'}



                      </span>







                    </div>







                  </td>







                </tr>







              ) : (







                /* ==================================================



                   DATA



                ================================================== */







                paginatedRequests.map(



                  (



                    request,



                    index,



                  ) => (







                    <tr



                      key={



                        request.requestId



                      }



                    >







                      {/* SERIAL NUMBER */}







                      <td>



                        {(currentPage - 1) *



                          PAGE_SIZE +



                          index +



                          1}



                      </td>







                      {/* =================================================



                          HR ONLY - EMPLOYEE



                      ================================================= */}







                      {isHR && (



                        <>



                          <td>



                            <div



                              className="comp-off-employee-cell"



                            >



                              <strong>



                                {request.employeeName ||



                                  '-'}



                              </strong>



                            </div>



                          </td>







                          <td>



                            {request.employeeCode ||



                              '-'}



                          </td>



                        </>



                      )}







                      {/* WORKED DATE */}







                      <td>



                        {formatDate(



                          request.workedDate,



                        )}



                      </td>







                      {/* DAY TYPE */}







                      <td>







                        <span



                          className={`day-type ${



                            request.dayType ===



                            'PUBLIC_HOLIDAY'



                              ? 'holiday'



                              : 'week-off'



                          }`}



                        >



                          {getDayTypeLabel(



                            request.dayType,



                          )}



                        </span>







                      </td>







                      {/* COMP OFF DATE */}







                      <td>







                        {request.compOffDate ? (







                          formatDate(



                            request.compOffDate,



                          )







                        ) : (







                          <span className="not-assigned">



                            Not Assigned



                          </span>







                        )}







                      </td>







                      {/* REQUESTED ON */}







                      <td>



                        {formatDate(



                          request.requestedOn,



                        )}



                      </td>







                      {/* REASON */}







                      <td>







                        <div className="comp-off-reason-cell">



                          {request.reason ||



                            '-'}



                        </div>







                      </td>







                      {/* STATUS */}







                      <td>







                        <span



                          className={`status ${getStatusClass(



                            request.status,



                          )}`}



                        >







                          <span />







                          {getStatusLabel(



                            request.status,



                          )}







                        </span>







                      </td>



                      {isHR && (

                        <td>

                          <div className="comp-off-row-actions">

                            <button type="button" title="View" aria-label="View Comp Off request" onClick={() => handleViewRequest(request)}>

                              <Eye size={16} />

                            </button>

                            {request.status === 'PENDING' && (

                              <>

                                <button type="button" title="Accept Comp Off" aria-label="Accept Comp Off request" className="comp-off-action-approve" disabled={submitting} onClick={() => handleApproveClick(request)}>

                                  <Check size={15} />

                                </button>

                                <button type="button" title="Reject Comp Off" aria-label="Reject Comp Off request" className="comp-off-action-reject" disabled={submitting} onClick={() => handleRejectClick(request)}>

                                  <X size={15} />

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







        {/* ====================================================



            TABLE FOOTER



        ==================================================== */}







        <div className="comp-off-table-footer">







          <span>







            Showing{' '}







            <strong>



              {paginatedRequests.length}



            </strong>







            {' '}of{' '}







            <strong>



              {filteredRequests.length}



            </strong>







            {' '}requests







          </span>







          {totalPages > 1 && (







            <div className="comp-off-pagination">







              <button



                type="button"



                disabled={



                  currentPage <= 1



                }



                onClick={() =>



                  setCurrentPage(



                    currentPage - 1,



                  )



                }



              >



                Previous



              </button>







              <span>



                Page {currentPage} of{' '}



                {totalPages}



              </span>







              <button



                type="button"



                disabled={



                  currentPage >=



                  totalPages



                }



                onClick={() =>



                  setCurrentPage(



                    currentPage + 1,



                  )



                }



              >



                Next



              </button>







            </div>







          )}







        </div>







      </section>







      {/* ======================================================



          ADD COMP OFF MODAL



      ====================================================== */}







      {!isHR && modalOpen && (







        <div



          className="comp-off-modal-overlay"



          onMouseDown={(event) => {







            if (



              event.target ===



              event.currentTarget



            ) {



              closeModal();



            }







          }}



        >







          <div className="comp-off-modal">







            {/* ==================================================



                MODAL HEADER



            ================================================== */}







            <div className="comp-off-modal-header">







              <div>







                <h2>



                  Add Comp Off



                </h2>







                <p>



                  Submit a compensatory



                  off request for a



                  holiday or week off you



                  worked.



                </p>







              </div>







              <button



                type="button"



                onClick={



                  closeModal



                }



                aria-label="Close"



                disabled={



                  submitting



                }



              >



                <X



                  size={18}



                />



              </button>







            </div>







            {/* ==================================================



                FORM



            ================================================== */}







            <form



              onSubmit={



                handleSubmit



              }



              className="comp-off-form"



            >







              {/* ==================================================



                  DATE + DAY TYPE



              ================================================== */}







              <div className="comp-off-form-row">







                {/* WORKED DATE */}







                <div className="comp-off-form-field">







                  <label>



                    Worked Date



                    <span>*</span>



                  </label>







                  <div className="form-date-input">







                    <input



                      type="date"



                      value={



                        form.workedDate



                      }



                      max={



                        getTodayDate()



                      }



                      onChange={(event) =>



                        handleFormChange(



                          'workedDate',



                          event.target.value,



                        )



                      }



                      required



                      disabled={



                        submitting



                      }



                    />







                    <CalendarDays



                      size={16}



                    />







                  </div>







                </div>







                {/* DAY TYPE */}







                <div className="comp-off-form-field">







                  <label>



                    Day Type



                    <span>*</span>



                  </label>







                  <select



                    value={



                      form.dayType



                    }



                    onChange={(event) =>



                      handleFormChange(



                        'dayType',



                        event.target.value as DayType,



                      )



                    }



                    disabled={



                      submitting



                    }



                  >







                    <option value="PUBLIC_HOLIDAY">



                      Public Holiday



                    </option>







                    <option value="WEEK_OFF">



                      Week Off



                    </option>







                  </select>







                </div>







              </div>







              {/* ==================================================



                  REASON



              ================================================== */}







              <div className="comp-off-form-field full">







                <label>



                  Reason / Remarks



                  <span>*</span>



                </label>







                <textarea



                  value={



                    form.reason



                  }



                  placeholder="Enter the reason for working on the holiday / week off..."



                  rows={4}



                  maxLength={500}



                  onChange={(event) =>



                    handleFormChange(



                      'reason',



                      event.target.value,



                    )



                  }



                  disabled={



                    submitting



                  }



                  required



                />







                <small>



                  {form.reason.length}



                  /500



                </small>







              </div>







              {/* ==================================================



                  ATTACHMENT



              ================================================== */}







              <div className="comp-off-form-field full">







                <label>



                  Supporting Document



                </label>







                <input



                  type="file"



                  accept=".pdf,.jpg,.jpeg,.png"



                  onChange={



                    handleAttachmentChange



                  }



                  disabled={



                    submitting



                  }



                />







                <small>



                  Optional. PDF, JPG,



                  JPEG or PNG. Maximum



                  size: 5 MB.



                </small>







                {form.attachment && (







                  <small>







                    Selected:{' '}







                    <strong>



                      {



                        form



                          .attachment



                          .name



                      }



                    </strong>







                  </small>







                )}







              </div>







              {/* ==================================================



                  FORM ERROR



              ================================================== */}







              {formError && (







                <div className="comp-off-form-error">



                  {formError}



                </div>







              )}







              {/* ==================================================



                  FORM ACTIONS



              ================================================== */}







              <div className="comp-off-form-actions">







                <button



                  type="button"



                  className="cancel-button"



                  onClick={



                    closeModal



                  }



                  disabled={



                    submitting



                  }



                >



                  Cancel



                </button>







                <button



                  type="submit"



                  className="submit-button"



                  disabled={



                    submitting



                  }



                >







                  <CheckCircle2



                    size={16}



                  />







                  {submitting



                    ? 'Submitting...'



                    : 'Submit Comp Off'}







                </button>







              </div>







            </form>







          </div>







        </div>







      )}









      {isHR && detailsOpen && selectedRequest && (

        <div className="comp-off-modal-overlay">

          <div className="comp-off-modal comp-off-action-modal">

            <div className="comp-off-modal-header">

              <div><h2>Comp Off Request Details</h2><p>Review employee request and approval history.</p></div>

              <button type="button" className="modal-close-button" onClick={closeActionModals}><X size={18} /></button>

            </div>

            <div className="comp-off-details-grid">

              <div><span>Employee</span><strong>{selectedRequest.employeeName || '-'}</strong></div>

              <div><span>Employee Code</span><strong>{selectedRequest.employeeCode || '-'}</strong></div>

              <div><span>Worked Date</span><strong>{formatDate(selectedRequest.workedDate)}</strong></div>

              <div><span>Day Type</span><strong>{getDayTypeLabel(selectedRequest.dayType)}</strong></div>

              <div><span>Requested On</span><strong>{formatDate(selectedRequest.requestedOn)}</strong></div>

              <div><span>Status</span><strong>{getStatusLabel(selectedRequest.status)}</strong></div>

              <div className="full"><span>Reason</span><strong>{selectedRequest.reason || '-'}</strong></div>

              <div><span>Comp Off Date</span><strong>{formatDate(selectedRequest.compOffDate)}</strong></div>

              {selectedRequest.status === 'APPROVED' && (<><div><span>Approved By</span><strong>{selectedRequest.approvedByName || selectedRequest.approvedBy || '-'}</strong></div><div><span>Approved On</span><strong>{formatDate(selectedRequest.approvedOn)}</strong></div><div className="full"><span>Remarks</span><strong>{selectedRequest.remarks || '-'}</strong></div></>)}

              {selectedRequest.status === 'REJECTED' && (<><div><span>Rejected By</span><strong>{selectedRequest.rejectedByName || selectedRequest.rejectedBy || '-'}</strong></div><div><span>Rejected On</span><strong>{formatDate(selectedRequest.rejectedOn)}</strong></div><div className="full"><span>Rejection Reason</span><strong>{selectedRequest.rejectionReason || '-'}</strong></div></>)}

            </div>

          </div>

        </div>

      )}



      {isHR && approveOpen && selectedRequest && (

        <div className="comp-off-modal-overlay">

          <div className="comp-off-modal comp-off-action-modal">

            <div className="comp-off-modal-header"><div><h2>Approve Comp Off</h2><p>{selectedRequest.employeeName || selectedRequest.employeeCode || 'Employee request'}</p></div><button type="button" className="modal-close-button" onClick={closeActionModals}><X size={18} /></button></div>

            {actionError && <div className="comp-off-error">{actionError}</div>}

            <div className="comp-off-action-form">
              <p>
                Are you sure you want to approve this Comp Off request?
              </p>
            </div>

            <div className="comp-off-modal-footer"><button type="button" className="secondary-button" onClick={closeActionModals} disabled={submitting}>Cancel</button><button type="button" className="submit-button" onClick={() => void handleApproveSubmit()} disabled={submitting}><Check size={16} /> {submitting ? 'Approving...' : 'Approve Comp Off'}</button></div>

          </div>

        </div>

      )}



      {isHR && rejectOpen && selectedRequest && (

        <div className="comp-off-modal-overlay">

          <div className="comp-off-modal comp-off-action-modal">

            <div className="comp-off-modal-header"><div><h2>Reject Comp Off</h2><p>{selectedRequest.employeeName || selectedRequest.employeeCode || 'Employee request'}</p></div><button type="button" className="modal-close-button" onClick={closeActionModals}><X size={18} /></button></div>

            {actionError && <div className="comp-off-error">{actionError}</div>}

            <div className="comp-off-action-form"><label>Rejection Reason <span>*</span><textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Enter reason for rejecting this request" rows={5} disabled={submitting} /></label></div>

            <div className="comp-off-modal-footer"><button type="button" className="secondary-button" onClick={closeActionModals} disabled={submitting}>Cancel</button><button type="button" className="comp-off-reject-submit" onClick={() => void handleRejectSubmit()} disabled={submitting}><X size={16} /> {submitting ? 'Rejecting...' : 'Reject Request'}</button></div>

          </div>

        </div>

      )}

    </div>



  );



};







export default CompOffPage;



