import React, {

  useCallback,

  useEffect,

  useMemo,

  useState,

} from "react";



import {

  AlertCircle,

  CalendarDays,

  Clock3,

  FileText,

  Loader2,

  MapPin,

  RefreshCw,

  Send,

  UserRound,

  BriefcaseBusiness,

  DollarSign,

  Eye,

} from "lucide-react";



import { joiningApprovalService } from "../../services/joiningApprovals.service";

import type { JoiningApproval } from "../../types/joiningApprovals.types";



import "./JoiningApprovalOnboardingDocuments.css";



interface OnboardingDocumentItem {

  id: number;

  package_id: number;

  document_type: string;

  file_name: string;

  file_path: string;

  status: string;

  generated_at: string | null;

  sent_at: string | null;

  error_message: string | null;

  created_at: string | null;

  updated_at: string | null;

}



interface OnboardingDocumentPackage {

  id: number;

  job_application_id: number;



  designation: string;

  department: string;

  location: string;

  reporting_manager: string;



  joining_date: string;

  interview_date: string;

  salary_from_month: string;



  annual_ctc: string;



  basic_monthly: string;

  basic_annual: string;



  hra_monthly: string;

  hra_annual: string;



  conveyance_monthly: string;

  conveyance_annual: string;



  education_allowance_monthly: string;

  education_allowance_annual: string;



  special_allowance_monthly: string;

  special_allowance_annual: string;



  lta_monthly: string;

  lta_annual: string;



  medical_monthly: string;

  medical_annual: string;



  mediclaim_monthly: string;

  mediclaim_annual: string;



  professional_tax_monthly: string;

  professional_tax_annual: string;



  pf_monthly: string;

  pf_annual: string;



  gratuity_monthly: string;

  gratuity_annual: string;



  sub_total_1_monthly: string;

  sub_total_1_annual: string;



  sub_total_deduction_monthly: string;

  sub_total_deduction_annual: string;



  sub_total_monthly: string;

  sub_total_annual: string;



  gross_ctc_monthly: string;

  gross_ctc_annual: string;



  status: string;



  created_by: number | null;

  updated_by: number | null;



  created_at: string | null;

  updated_at: string | null;



  generated_at: string | null;

  sent_at: string | null;



  email_status: string | null;

  email_error: string | null;



  items: OnboardingDocumentItem[];

}



interface JoiningApprovalOnboardingDocumentsProps {

  candidate: JoiningApproval;

}



interface OnboardingDocumentForm {

  designation: string;

  department: string;

  location: string;

  reporting_manager: string;



  joining_date: string;

  interview_date: string;

  salary_from_month: string;



  annual_ctc: string;



  basic_monthly: string;

  basic_annual: string;



  hra_monthly: string;

  hra_annual: string;



  conveyance_monthly: string;

  conveyance_annual: string;



  education_allowance_monthly: string;

  education_allowance_annual: string;



  special_allowance_monthly: string;

  special_allowance_annual: string;



  lta_monthly: string;

  lta_annual: string;



  medical_monthly: string;

  medical_annual: string;



  mediclaim_monthly: string;

  mediclaim_annual: string;



  professional_tax_monthly: string;

  professional_tax_annual: string;



  pf_monthly: string;

  pf_annual: string;



  gratuity_monthly: string;

  gratuity_annual: string;



  sub_total_1_monthly: string;

  sub_total_1_annual: string;



  sub_total_deduction_monthly: string;

  sub_total_deduction_annual: string;



  sub_total_monthly: string;

  sub_total_annual: string;



  gross_ctc_monthly: string;

  gross_ctc_annual: string;

}



const zero = "0";




const normalizeDateForApi = (

  value?: string | null,

): string => {

  if (!value) return "";



  const trimmed = value.trim();



  if (!trimmed) return "";



  // Already YYYY-MM-DD

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {

    return trimmed;

  }



  // ISO datetime

  if (

    /^\d{4}-\d{2}-\d{2}T/.test(trimmed)

  ) {

    return trimmed.substring(0, 10);

  }



  // DD-MM-YYYY

  const ddmmyyyy = trimmed.match(

    /^(\d{2})-(\d{2})-(\d{4})$/,

  );



  if (ddmmyyyy) {

    const [, day, month, year] = ddmmyyyy;



    return `${year}-${month}-${day}`;

  }



  // DD/MM/YYYY

  const slashDate = trimmed.match(

    /^(\d{2})\/(\d{2})\/(\d{4})$/,

  );



  if (slashDate) {

    const [, day, month, year] = slashDate;



    return `${year}-${month}-${day}`;

  }



  const parsed = new Date(trimmed);



  if (Number.isNaN(parsed.getTime())) {

    return "";

  }



  return parsed.toISOString().substring(0, 10);

};



const createInitialForm = (

  candidate: JoiningApproval,

): OnboardingDocumentForm => ({

  designation: candidate.designation || "",

  department: candidate.department || "",

  location: candidate.location || "",

  reporting_manager: "",



  joining_date: normalizeDateForApi(

    candidate.joiningDate,

  ),



  interview_date: "",



  salary_from_month: "",



  annual_ctc: zero,



  basic_monthly: zero,

  basic_annual: zero,



  hra_monthly: zero,

  hra_annual: zero,



  conveyance_monthly: zero,

  conveyance_annual: zero,



  education_allowance_monthly: zero,

  education_allowance_annual: zero,



  special_allowance_monthly: zero,

  special_allowance_annual: zero,



  lta_monthly: zero,

  lta_annual: zero,



  medical_monthly: zero,

  medical_annual: zero,



  mediclaim_monthly: zero,

  mediclaim_annual: zero,



  professional_tax_monthly: zero,

  professional_tax_annual: zero,



  pf_monthly: zero,

  pf_annual: zero,



  gratuity_monthly: zero,

  gratuity_annual: zero,



  sub_total_1_monthly: zero,

  sub_total_1_annual: zero,



  sub_total_deduction_monthly: zero,

  sub_total_deduction_annual: zero,



  sub_total_monthly: zero,

  sub_total_annual: zero,



  gross_ctc_monthly: zero,

  gross_ctc_annual: zero,

});



const formatDate = (

  value?: string | null,

): string => {

  if (!value) return "-";



  const normalized =

    normalizeDateForApi(value);



  if (!normalized) {

    return value;

  }



  const date = new Date(

    `${normalized}T00:00:00`,

  );



  if (Number.isNaN(date.getTime())) {

    return value;

  }



  return date.toLocaleDateString("en-GB", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

};



const getDocumentStatusClass = (

  status?: string | null,

): string => {

  const normalized = (

    status || ""

  )

    .trim()

    .toLowerCase();



  if (

    normalized.includes("sent") ||

    normalized.includes("generated") ||

    normalized.includes("success")

  ) {

    return "is-success";

  }



  if (

    normalized.includes("pending") ||

    normalized.includes("processing") ||

    normalized.includes("draft")

  ) {

    return "is-pending";

  }



  if (

    normalized.includes("failed") ||

    normalized.includes("error")

  ) {

    return "is-error";

  }



  return "is-neutral";

};




const getApiErrorMessage = (

  error: any,

): string => {

  const responseData =

    error?.response?.data;



  if (

    typeof responseData?.detail ===

    "string"

  ) {

    return responseData.detail;

  }



  if (

    Array.isArray(responseData?.detail)

  ) {

    return responseData.detail

      .map((item: any) => {

        const location = Array.isArray(

          item?.loc,

        )

          ? item.loc

              .filter(

                (part: unknown) =>

                  part !== "body",

              )

              .join(".")

          : "";



        const message =

          item?.msg ||

          "Validation error";



        return location

          ? `${location}: ${message}`

          : message;

      })

      .join(" | ");

  }



  if (

    typeof responseData?.message ===

    "string"

  ) {

    return responseData.message;

  }



  if (

    typeof error?.message ===

    "string"

  ) {

    return error.message;

  }



  return "Request failed. Please check the entered information.";

};



export const JoiningApprovalOnboardingDocuments: React.FC<

  JoiningApprovalOnboardingDocumentsProps

> = ({ candidate }) => {

  const [packageData, setPackageData] =

    useState<OnboardingDocumentPackage | null>(

      null,

    );



  const [form, setForm] =

    useState<OnboardingDocumentForm>(() =>

      createInitialForm(candidate),

    );



  const [loading, setLoading] =

    useState(false);



  const [saving, setSaving] =

    useState(false);



  const [error, setError] =

    useState<string | null>(null);



  const [showCompensation, setShowCompensation] =

    useState(false);



  const applicationId = useMemo(

    () => Number(candidate.id),

    [candidate.id],

  );



  const loadPackage = useCallback(

    async (): Promise<void> => {

      if (

        !Number.isInteger(applicationId) ||

        applicationId <= 0

      ) {

        setError(

          "Invalid job application ID.",

        );

        return;

      }



      setLoading(true);

      setError(null);



      try {

        const result =

          await joiningApprovalService.getOnboardingDocumentPackage(

            String(applicationId),

          );



        setPackageData(result);



        setForm({

          designation:

            result.designation ||

            candidate.designation ||

            "",



          department:

            result.department ||

            candidate.department ||

            "",



          location:

            result.location ||

            candidate.location ||

            "",



          reporting_manager:

            result.reporting_manager || "",



          joining_date:

            normalizeDateForApi(

              result.joining_date ||

                candidate.joiningDate,

            ),



          interview_date: normalizeDateForApi(result.interview_date),



          salary_from_month: normalizeDateForApi(result.salary_from_month),



          annual_ctc:

            result.annual_ctc || zero,



          basic_monthly:

            result.basic_monthly || zero,



          basic_annual:

            result.basic_annual || zero,



          hra_monthly:

            result.hra_monthly || zero,



          hra_annual:

            result.hra_annual || zero,



          conveyance_monthly:

            result.conveyance_monthly || zero,



          conveyance_annual:

            result.conveyance_annual || zero,



          education_allowance_monthly:

            result.education_allowance_monthly ||

            zero,



          education_allowance_annual:

            result.education_allowance_annual ||

            zero,



          special_allowance_monthly:

            result.special_allowance_monthly ||

            zero,



          special_allowance_annual:

            result.special_allowance_annual ||

            zero,



          lta_monthly:

            result.lta_monthly || zero,



          lta_annual:

            result.lta_annual || zero,



          medical_monthly:

            result.medical_monthly || zero,



          medical_annual:

            result.medical_annual || zero,



          mediclaim_monthly:

            result.mediclaim_monthly || zero,



          mediclaim_annual:

            result.mediclaim_annual || zero,



          professional_tax_monthly:

            result.professional_tax_monthly ||

            zero,



          professional_tax_annual:

            result.professional_tax_annual ||

            zero,



          pf_monthly:

            result.pf_monthly || zero,



          pf_annual:

            result.pf_annual || zero,



          gratuity_monthly:

            result.gratuity_monthly || zero,



          gratuity_annual:

            result.gratuity_annual || zero,



          sub_total_1_monthly:

            result.sub_total_1_monthly ||

            zero,



          sub_total_1_annual:

            result.sub_total_1_annual ||

            zero,



          sub_total_deduction_monthly:

            result.sub_total_deduction_monthly ||

            zero,



          sub_total_deduction_annual:

            result.sub_total_deduction_annual ||

            zero,



          sub_total_monthly:

            result.sub_total_monthly ||

            zero,



          sub_total_annual:

            result.sub_total_annual ||

            zero,



          gross_ctc_monthly:

            result.gross_ctc_monthly ||

            zero,



          gross_ctc_annual:

            result.gross_ctc_annual ||

            zero,

        });

      } catch (err: any) {

        if (

          err?.response?.status ===

          404

        ) {

          setPackageData(null);

          setForm(

            createInitialForm(candidate),

          );

          return;

        }



        console.error(

          "Failed to load onboarding document package:",

          err,

        );



        setError(

          getApiErrorMessage(err),

        );

      } finally {

        setLoading(false);

      }

    },

    [applicationId, candidate],

  );



  useEffect(() => {

    void loadPackage();

  }, [loadPackage]);



  const handleChange = (

    field: keyof OnboardingDocumentForm,

    value: string,

  ): void => {

    setForm((previous) => ({

      ...previous,

      [field]: value,

    }));

  };



  const handleCreatePackage =

    async (): Promise<void> => {

      if (

        !Number.isInteger(applicationId) ||

        applicationId <= 0

      ) {

        setError(

          "Invalid job application ID.",

        );

        return;

      }



      if (!form.designation.trim()) {

        setError(

          "Designation is required.",

        );

        return;

      }



      if (!form.department.trim()) {

        setError(

          "Department is required.",

        );

        return;

      }



      if (!form.location.trim()) {

        setError(

          "Location is required.",

        );

        return;

      }



      const joiningDate =

        normalizeDateForApi(

          form.joining_date,

        );



      const interviewDate =

        normalizeDateForApi(

          form.interview_date,

        );



      const salaryFromMonth =

        normalizeDateForApi(

          form.salary_from_month,

        );



      if (!joiningDate) {

        setError(

          "Joining date is required.",

        );

        return;

      }



      if (!interviewDate) {

        setError(

          "Interview date is required.",

        );

        return;

      }



      if (!salaryFromMonth) {

        setError(

          "Salary from month is required.",

        );

        return;

      }



      setSaving(true);

      setError(null);



      try {


        const payload = {

          job_application_id:

            applicationId,



          designation:

            form.designation.trim(),



          department:

            form.department.trim(),



          location:

            form.location.trim(),



          reporting_manager:

            form.reporting_manager.trim() ||

            "string",



          joining_date:

            joiningDate,



          interview_date:

            interviewDate,



          salary_from_month:

            salaryFromMonth,



          annual_ctc:

            Number(form.annual_ctc) || 0,



          basic_monthly:

            Number(form.basic_monthly) || 0,



          basic_annual:

            Number(form.basic_annual) || 0,



          hra_monthly:

            Number(form.hra_monthly) || 0,



          hra_annual:

            Number(form.hra_annual) || 0,



          conveyance_monthly:

            Number(

              form.conveyance_monthly,

            ) || 0,



          conveyance_annual:

            Number(

              form.conveyance_annual,

            ) || 0,



          education_allowance_monthly:

            Number(

              form.education_allowance_monthly,

            ) || 0,



          education_allowance_annual:

            Number(

              form.education_allowance_annual,

            ) || 0,



          special_allowance_monthly:

            Number(

              form.special_allowance_monthly,

            ) || 0,



          special_allowance_annual:

            Number(

              form.special_allowance_annual,

            ) || 0,



          lta_monthly:

            Number(form.lta_monthly) || 0,



          lta_annual:

            Number(form.lta_annual) || 0,



          medical_monthly:

            Number(form.medical_monthly) || 0,



          medical_annual:

            Number(form.medical_annual) || 0,



          mediclaim_monthly:

            Number(

              form.mediclaim_monthly,

            ) || 0,



          mediclaim_annual:

            Number(

              form.mediclaim_annual,

            ) || 0,



          professional_tax_monthly:

            Number(

              form.professional_tax_monthly,

            ) || 0,



          professional_tax_annual:

            Number(

              form.professional_tax_annual,

            ) || 0,



          pf_monthly:

            Number(form.pf_monthly) || 0,



          pf_annual:

            Number(form.pf_annual) || 0,



          gratuity_monthly:

            Number(

              form.gratuity_monthly,

            ) || 0,



          gratuity_annual:

            Number(

              form.gratuity_annual,

            ) || 0,




          sub_total_1_monthly:

            Number(

              form.sub_total_1_monthly,

            ) || 0,



          sub_total_1_annual:

            Number(

              form.sub_total_1_annual,

            ) || 0,



          sub_total_deduction_monthly:

            Number(

              form.sub_total_deduction_monthly,

            ) || 0,



          sub_total_deduction_annual:

            Number(

              form.sub_total_deduction_annual,

            ) || 0,



          sub_total_monthly:

            Number(

              form.sub_total_monthly,

            ) || 0,



          sub_total_annual:

            Number(

              form.sub_total_annual,

            ) || 0,



          gross_ctc_monthly:

            Number(

              form.gross_ctc_monthly,

            ) || 0,



          gross_ctc_annual:

            Number(

              form.gross_ctc_annual,

            ) || 0,

        };



        console.log(

          "ONBOARDING DOCUMENT REQUEST:",

          payload,

        );



        const created =

          await joiningApprovalService.createOnboardingDocumentPackage(

            payload,

          );



        setPackageData(created);



        setForm((previous) => ({

          ...previous,



          sub_total_1_monthly:

            created.sub_total_1_monthly ||

            previous.sub_total_1_monthly,



          sub_total_1_annual:

            created.sub_total_1_annual ||

            previous.sub_total_1_annual,



          sub_total_deduction_monthly:

            created.sub_total_deduction_monthly ||

            previous.sub_total_deduction_monthly,



          sub_total_deduction_annual:

            created.sub_total_deduction_annual ||

            previous.sub_total_deduction_annual,



          sub_total_monthly:

            created.sub_total_monthly ||

            previous.sub_total_monthly,



          sub_total_annual:

            created.sub_total_annual ||

            previous.sub_total_annual,



          gross_ctc_monthly:

            created.gross_ctc_monthly ||

            previous.gross_ctc_monthly,



          gross_ctc_annual:

            created.gross_ctc_annual ||

            previous.gross_ctc_annual,

        }));



        const emailStatus = String(
          created.email_status || "",
        )
          .trim()
          .toLowerCase();

        if (
          emailStatus === "sent" ||
          emailStatus === "success" ||
          emailStatus === "succeeded"
        ) {
          window.alert(
            "Documents on the email sent successfully.",
          );
        } else if (
          emailStatus === "failed" ||
          emailStatus === "error"
        ) {
          setError(
            created.email_error ||
              "Document package was saved, but the onboarding email could not be sent.",
          );
        } else {
          window.alert(
            "Onboarding document package saved successfully. Email status is pending.",
          );
        }

      } catch (err: any) {

        console.error(

          "Failed to save onboarding document package:",

          err,

        );



        const message =

          getApiErrorMessage(err);



        setError(message);

      } finally {

        setSaving(false);

      }

    };



  const openDocument = (

    filePath: string,

  ): void => {

    if (!filePath) return;



    if (

      filePath.startsWith("http://") ||

      filePath.startsWith("https://")

    ) {

      window.open(

        filePath,

        "_blank",

        "noopener,noreferrer",

      );

      return;

    }



    const normalizedPath = filePath

      .replace(/\\/g, "/")

      .replace(/^\/+/, "");



    const uploadsIndex =

      normalizedPath.indexOf(

        "uploads/",

      );



    if (uploadsIndex === -1) {

      window.alert(

        "Document path is not available.",

      );

      return;

    }



    const relativePath =

      normalizedPath.substring(

        uploadsIndex,

      );




    const baseUrl =

      import.meta.env

        .VITE_API_BASE_URL ||

      "http://192.168.1.5:8001";



    window.open(

      `${baseUrl.replace(

        /\/$/,

        "",

      )}/${relativePath}`,

      "_blank",

      "noopener,noreferrer",

    );

  };



  if (loading) {

    return (

      <section className="onboarding-documents-card">

        <div className="onboarding-documents-loading">

          <Loader2

            size={24}

            className="spin"

          />



          <span>

            Loading onboarding documents...

          </span>

        </div>

      </section>

    );

  }



  return (

    <section className="onboarding-documents-card">

      <div className="onboarding-documents-header">

        <div>

          <div className="onboarding-documents-title-row">

            <div className="onboarding-documents-title-icon">

              <FileText size={20} />

            </div>



            <div>

              <h3>

                Onboarding Documents

              </h3>



              <p>

                Create and manage the

                document package for this

                candidate.

              </p>

            </div>

          </div>

        </div>



        <button

          type="button"

          className="onboarding-documents-refresh"

          onClick={() =>

            void loadPackage()

          }

          disabled={loading}

        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </div>



      {error && (

        <div className="onboarding-documents-error">

          <AlertCircle size={18} />



          <span>{error}</span>

        </div>

      )}



      <div className="onboarding-documents-candidate">

        <div className="onboarding-documents-candidate-item">

          <UserRound size={17} />



          <div>

            <span>Candidate</span>



            <strong>

              {candidate.candidateName}

            </strong>

          </div>

        </div>



        <div className="onboarding-documents-candidate-item">

          <BriefcaseBusiness size={17} />



          <div>

            <span>Designation</span>



            <strong>

              {form.designation || "-"}

            </strong>

          </div>

        </div>



        <div className="onboarding-documents-candidate-item">

          <MapPin size={17} />



          <div>

            <span>Location</span>



            <strong>

              {form.location || "-"}

            </strong>

          </div>

        </div>



        <div className="onboarding-documents-candidate-item">

          <CalendarDays size={17} />



          <div>

            <span>Joining Date</span>



            <strong>

              {formatDate(

                form.joining_date,

              )}

            </strong>

          </div>

        </div>

      </div>



      <div className="onboarding-documents-section">

        <div className="onboarding-documents-section-header">

          <div>

            <h4>

              Employment & Joining Details

            </h4>



            <p>

              Details used while generating

              the onboarding package.

            </p>

          </div>

        </div>



        <div className="onboarding-documents-form-grid">

          <label>

            <span>Designation</span>



            <input

              type="text"

              value={form.designation}

              onChange={(event) =>

                handleChange(

                  "designation",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>Department</span>



            <input

              type="text"

              value={form.department}

              onChange={(event) =>

                handleChange(

                  "department",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>Location</span>



            <input

              type="text"

              value={form.location}

              onChange={(event) =>

                handleChange(

                  "location",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Reporting Manager

            </span>



            <input

              type="text"

              value={form.reporting_manager}

              onChange={(event) =>

                handleChange(

                  "reporting_manager",

                  event.target.value,

                )

              }

              placeholder="Enter reporting manager"

            />

          </label>



          <label>

            <span>Joining Date</span>



            <input

              type="date"

              value={normalizeDateForApi(

                form.joining_date,

              )}

              onChange={(event) =>

                handleChange(

                  "joining_date",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Interview Date

            </span>



            <input

              type="date"

              value={normalizeDateForApi(

                form.interview_date,

              )}

              onChange={(event) =>

                handleChange(

                  "interview_date",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Salary From Month

            </span>



            <input

              type="date"

              value={normalizeDateForApi(

                form.salary_from_month,

              )}

              onChange={(event) =>

                handleChange(

                  "salary_from_month",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>Annual CTC</span>



            <div className="onboarding-documents-input-prefix">

              <span>₹</span>



              <input

                type="number"

                min="0"

                step="0.01"

                value={form.annual_ctc}

                onChange={(event) =>

                  handleChange(

                    "annual_ctc",

                    event.target.value,

                  )

                }

              />

            </div>

          </label>

        </div>

      </div>



      <div className="onboarding-documents-section">

        <button

          type="button"

          className="onboarding-documents-compensation-toggle"

          onClick={() =>

            setShowCompensation(

              (previous) => !previous,

            )

          }

        >

          <div>

            <div className="onboarding-documents-section-icon">

              <DollarSign size={17} />

            </div>



            <div>

              <strong>

                Compensation Breakdown

              </strong>



              <span>

                Monthly and annual salary

                components

              </span>

            </div>

          </div>



          <span>

            {showCompensation

              ? "Hide"

              : "Configure"}

          </span>

        </button>



        {showCompensation && (

          <div className="onboarding-documents-compensation-grid">

            {[

              ["basic", "Basic"],

              ["hra", "HRA"],

              [

                "conveyance",

                "Conveyance",

              ],

              [

                "education_allowance",

                "Education Allowance",

              ],

              [

                "special_allowance",

                "Special Allowance",

              ],

              ["lta", "LTA"],

              ["medical", "Medical"],

              [

                "mediclaim",

                "Mediclaim",

              ],

              [

                "professional_tax",

                "Professional Tax",

              ],

              ["pf", "PF"],

              [

                "gratuity",

                "Gratuity",

              ],

            ].map(

              ([key, label]) => (

                <div

                  className="onboarding-documents-salary-row"

                  key={key}

                >

                  <div>

                    <strong>

                      {label}

                    </strong>



                    <span>

                      Monthly

                    </span>



                    <input

                      type="number"

                      min="0"

                      step="0.01"

                      value={

                        form[

                          `${key}_monthly` as keyof OnboardingDocumentForm

                        ] as string

                      }

                      onChange={(event) =>

                        handleChange(

                          `${key}_monthly` as keyof OnboardingDocumentForm,

                          event.target

                            .value,

                        )

                      }

                    />

                  </div>



                  <div>

                    <strong>

                      &nbsp;

                    </strong>



                    <span>

                      Annual

                    </span>



                    <input

                      type="number"

                      min="0"

                      step="0.01"

                      value={

                        form[

                          `${key}_annual` as keyof OnboardingDocumentForm

                        ] as string

                      }

                      onChange={(event) =>

                        handleChange(

                          `${key}_annual` as keyof OnboardingDocumentForm,

                          event.target

                            .value,

                        )

                      }

                    />

                  </div>

                </div>

              ),

            )}

          </div>

        )}

      </div>



      <div className="onboarding-documents-section">

        <div className="onboarding-documents-section-header">

          <div>

            <h4>

              Package Totals

            </h4>



            <p>

              Required totals for the onboarding

              document package.

            </p>

          </div>

        </div>



        <div className="onboarding-documents-form-grid">

          <label>

            <span>

              Sub Total 1 Monthly

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_1_monthly

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_1_monthly",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Sub Total 1 Annual

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_1_annual

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_1_annual",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Deduction Monthly

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_deduction_monthly

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_deduction_monthly",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Deduction Annual

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_deduction_annual

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_deduction_annual",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Sub Total Monthly

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_monthly

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_monthly",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Sub Total Annual

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.sub_total_annual

              }

              onChange={(event) =>

                handleChange(

                  "sub_total_annual",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Gross CTC Monthly

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.gross_ctc_monthly

              }

              onChange={(event) =>

                handleChange(

                  "gross_ctc_monthly",

                  event.target.value,

                )

              }

            />

          </label>



          <label>

            <span>

              Gross CTC Annual

            </span>



            <input

              type="number"

              min="0"

              step="0.01"

              value={

                form.gross_ctc_annual

              }

              onChange={(event) =>

                handleChange(

                  "gross_ctc_annual",

                  event.target.value,

                )

              }

            />

          </label>

        </div>

      </div>



      <div className="onboarding-documents-actions">

        <button

          type="button"

          className="onboarding-documents-create-btn"

          onClick={() =>

            void handleCreatePackage()

          }

          disabled={saving}

        >

          {saving ? (

            <Loader2

              size={17}

              className="spin"

            />

          ) : (

            <Send size={17} />

          )}



          {packageData

            ? "Update Document Package"

            : "Create Document Package"}

        </button>

      </div>



      {packageData && (

        <div className="onboarding-documents-generated">

          <div className="onboarding-documents-generated-header">

            <div>

              <h4>

                Generated Documents

              </h4>



              <p>

                Documents currently associated

                with this onboarding package.

              </p>

            </div>



            <span

              className={`onboarding-package-status ${getDocumentStatusClass(

                packageData.status,

              )}`}

            >

              {packageData.status ||

                "DRAFT"}

            </span>

          </div>



          {packageData.items?.length >

          0 ? (

            <div className="onboarding-document-list">

              {packageData.items.map(

                (document) => (

                  <div

                    className="onboarding-document-row"

                    key={document.id}

                  >

                    <div className="onboarding-document-icon">

                      <FileText

                        size={19}

                      />

                    </div>



                    <div className="onboarding-document-info">

                      <strong>

                        {document.document_type ||

                          document.file_name ||

                          "Document"}

                      </strong>



                      <span>

                        {document.file_name ||

                          "File not available"}

                      </span>



                      {document.generated_at && (

                        <small>

                          Generated{" "}

                          {formatDate(

                            document.generated_at,

                          )}

                        </small>

                      )}

                    </div>



                    <span

                      className={`onboarding-document-status ${getDocumentStatusClass(

                        document.status,

                      )}`}

                    >

                      {document.status ||

                        "Pending"}

                    </span>



                    <button

                      type="button"

                      className="onboarding-document-view-btn"

                      disabled={

                        !document.file_path

                      }

                      onClick={() =>

                        openDocument(

                          document.file_path,

                        )

                      }

                    >

                      <Eye size={15} />

                      View

                    </button>

                  </div>

                ),

              )}

            </div>

          ) : (

            <div className="onboarding-documents-empty">

              <Clock3 size={20} />



              <div>

                <strong>

                  No documents generated

                  yet

                </strong>



                <span>

                  The package has been saved,

                  but no document files are

                  associated yet.

                </span>

              </div>

            </div>

          )}

        </div>

      )}



      {!packageData && !error && (

        <div className="onboarding-documents-empty onboarding-documents-empty--large">

          <FileText size={26} />



          <div>

            <strong>

              No onboarding document

              package found

            </strong>



            <span>

              Complete the package details

              above and create the onboarding

              document package.

            </span>

          </div>

        </div>

      )}

    </section>

  );

};



export default JoiningApprovalOnboardingDocuments;
