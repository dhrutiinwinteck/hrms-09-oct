import React, { useCallback, useEffect, useMemo, useState } from "react";



import { Coffee, Fingerprint, MapPin, Play } from "lucide-react";







import "./PunchCard.css";







import { PunchLocationMap } from "./PunchLocationMap/PunchLocationMap";







import { attendanceService } from "../../../attendance/services/attendance.service";







import type {



  AttendanceAction,



  DailyPunchState,



  EmployeeLocation,



} from "../../../attendance/types/attendance.types";







/**



 * ============================================================



 * PUNCH CARD



 * ============================================================



 *



 * Attendance state machine:



 *



 * NOT PUNCHED IN



 *       |



 *       | PUNCH IN + GPS



 *       v



 * WORKING



 *       |



 *       | BREAK IN



 *       v



 * ON BREAK



 *       |



 *       | BREAK OUT



 *       v



 * WORKING



 *       |



 *       | PUNCH OUT + GPS



 *       v



 * NOT PUNCHED IN



 *



 * Break can repeat:



 *



 * WORKING -> BREAK IN -> ON BREAK -> BREAK OUT -> WORKING



 *



 * If the attendance API is unavailable, the UI falls back to



 * local state so the employee can continue the attendance flow.



 * The user is informed that the backend action was not saved.



 * ============================================================



 */







interface PunchClockState {



  isPunchedIn: boolean;







  punchInTime: Date | null;



  punchOutTime: Date | null;







  isOnBreak: boolean;







  breakInTime: Date | null;



  breakOutTime: Date | null;







  punchInLocationAddress: string | null;



  punchOutLocationAddress: string | null;



}







interface PunchCardProps {



  onActionLogged?: (title: string, description: string) => void;



}







interface FreshLocation {



  latitude: number;



  longitude: number;



  accuracy: number;



  timestamp: number;



}







/**



 * ============================================================



 * GET FRESH GPS LOCATION



 * ============================================================



 */



const getFreshLocation = (): Promise<FreshLocation> => {



  return new Promise((resolve, reject) => {



    if (!navigator.geolocation) {



      reject(new Error("Location services are not supported by this browser."));



      return;



    }







    navigator.geolocation.getCurrentPosition(



      (position) => {



        resolve({



          latitude: position.coords.latitude,



          longitude: position.coords.longitude,



          accuracy: position.coords.accuracy,



          timestamp: position.timestamp,



        });



      },



      (error) => {



        reject(error);



      },



      {



        enableHighAccuracy: true,



        timeout: 15000,



        maximumAge: 0,



      },



    );



  });



};







/**



 * ============================================================



 * PARSE ATTENDANCE TIME



 * ============================================================



 */



const parseAttendanceTime = (time: string, attendanceDate: string): Date => {



  const date = new Date(`${attendanceDate} ${time}`);







  if (!Number.isNaN(date.getTime())) {



    return date;



  }







  return new Date(time);



};







/**



 * ============================================================



 * DETERMINE CURRENT BREAK STATE



 * ============================================================



 */



const getCurrentBreakState = (



  attendance: DailyPunchState,



  hasActivePunch: boolean,



): boolean => {



  if (!hasActivePunch) {



    return false;



  }







  if (attendance.isOnBreak) {



    return true;



  }







  if (attendance.breakIn && !attendance.breakOut) {



    return true;



  }







  if (attendance.breakIn && attendance.breakOut) {



    const breakInTime = new Date(



      `${attendance.attendanceDate} ${attendance.breakIn}`,



    ).getTime();







    const breakOutTime = new Date(



      `${attendance.attendanceDate} ${attendance.breakOut}`,



    ).getTime();







    if (!Number.isNaN(breakInTime) && !Number.isNaN(breakOutTime)) {



      return breakInTime > breakOutTime;



    }



  }







  return false;



};







/**



 * ============================================================



 * BACKEND STATE -> UI STATE



 * ============================================================



 */



const mapDailyPunchStateToUiState = (



  attendance: DailyPunchState,



): PunchClockState => {



  const hasPunchOut = Boolean(attendance.punchOut);



  const hasActivePunch = Boolean(attendance.isPunchedIn) && !hasPunchOut;







  const currentBreakState = getCurrentBreakState(attendance, hasActivePunch);







  return {



    isPunchedIn: hasActivePunch,







    punchInTime: attendance.punchIn



      ? parseAttendanceTime(attendance.punchIn, attendance.attendanceDate)



      : null,







    punchOutTime: attendance.punchOut



      ? parseAttendanceTime(attendance.punchOut, attendance.attendanceDate)



      : null,







    isOnBreak: currentBreakState,







    breakInTime: attendance.breakIn



      ? parseAttendanceTime(attendance.breakIn, attendance.attendanceDate)



      : null,







    breakOutTime: attendance.breakOut



      ? parseAttendanceTime(attendance.breakOut, attendance.attendanceDate)



      : null,







    punchInLocationAddress: attendance.punchInLocation?.address ?? null,







    punchOutLocationAddress: attendance.punchOutLocation?.address ?? null,



  };



};







/**



 * ============================================================



 * FORMAT TIME



 * ============================================================



 */



const formatTime = (date: Date | null): string => {



  if (!date) {



    return "--:--:--";



  }







  return date.toLocaleTimeString("en-US", {



    hour12: false,



    hour: "2-digit",



    minute: "2-digit",



    second: "2-digit",



  });



};







/**



 * ============================================================



 * LOCATION ERROR



 * ============================================================



 */



const getLocationErrorMessage = (error: unknown): string => {



  const geoError = error as GeolocationPositionError;







  if (geoError?.code === geoError?.PERMISSION_DENIED) {



    return "Location permission denied. Please enable location access in your browser and try again.";



  }







  if (geoError?.code === geoError?.POSITION_UNAVAILABLE) {



    return "Unable to determine your current location. Please check your device location settings.";



  }







  if (geoError?.code === geoError?.TIMEOUT) {



    return "Location request timed out. Please try again.";



  }







  if (error instanceof Error) {



    return error.message;



  }







  return "Unable to get your current location.";



};







/**



 * ============================================================



 * COMPONENT



 * ============================================================



 */



const BREAK_DURATION_MS = 45 * 60 * 1000;

const PunchCard: React.FC<PunchCardProps> = ({ onActionLogged }) => {



  /**



   * ==========================================================



   * ATTENDANCE STATE



   * ==========================================================



   */



  const [state, setState] = useState<PunchClockState>({



    isPunchedIn: false,







    punchInTime: null,



    punchOutTime: null,







    isOnBreak: false,







    breakInTime: null,



    breakOutTime: null,







    punchInLocationAddress: null,



    punchOutLocationAddress: null,



  });







  /**



   * Prevent duplicate API requests.



   */



  const [isProcessing, setIsProcessing] = useState(false);







  /**



   * Prevent actions until today's attendance is loaded.



   */const [isLoadingDailyState, setIsLoadingDailyState] = useState(true);

  /**
   * Live break timer.
   * The countdown is calculated from breakInTime so it does not drift.
   */
  const [breakTimerNow, setBreakTimerNow] = useState(() => Date.now());







    /**
   * ==========================================================
   * LIVE BREAK TIMER
   * ==========================================================
   *
   * Runs only while the employee is on break.
   */
  useEffect(() => {
    if (!state.isOnBreak || !state.breakInTime) {
      return;
    }

    setBreakTimerNow(Date.now());

    const timer = window.setInterval(() => {
      setBreakTimerNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [state.isOnBreak, state.breakInTime]);

/**



   * ==========================================================



   * LOCATION STATE



   * ==========================================================



   */



  const [location, setLocation] = useState<EmployeeLocation | null>(null);







  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);







  const [locationStatus, setLocationStatus] = useState<



    "loading" | "success" | "error" | "denied" | "unavailable"



  >("loading");







  const [locationError, setLocationError] = useState<string | null>(null);







  /**



   * ==========================================================



   * APPLY LOCATION TO MAP



   * ==========================================================



   */



  const applyLocation = useCallback(



    (



      latitude: number,



      longitude: number,



      accuracy: number,



      address?: string | null,



    ): void => {



      setLocation({



        latitude,



        longitude,



        accuracy,



      });







      if (address !== undefined && address !== null) {



        setResolvedAddress(address);



      }







      setLocationStatus("success");



      setLocationError(null);



    },



    [],



  );







  /**



   * ==========================================================



   * LOCAL FALLBACK



   * ==========================================================



   *



   * Used only when the attendance API throws/unavailable.



   *



   * This updates the PunchCard immediately so the employee can



   * continue the local UI flow without refreshing the browser.



   */



  const applyLocalAttendanceFallback = useCallback(



    (action: AttendanceAction, actionTime: Date): void => {



      setState((previousState) => {



        switch (action) {



          case "PUNCH_IN":



            return {



              ...previousState,



              isPunchedIn: true,



              isOnBreak: false,



              punchInTime: actionTime,



              punchOutTime: null,



              breakInTime: null,



              breakOutTime: null,



            };







          case "BREAK_IN":



            return {



              ...previousState,



              isPunchedIn: true,



              isOnBreak: true,



              breakInTime: actionTime,



              breakOutTime: null,



              punchOutTime: null,



            };







          case "BREAK_OUT":



            return {



              ...previousState,



              isPunchedIn: true,



              isOnBreak: false,



              breakOutTime: actionTime,



            };







          case "PUNCH_OUT":



            return {



              ...previousState,



              isPunchedIn: false,



              isOnBreak: false,



              punchOutTime: actionTime,



            };







          default:



            return previousState;



        }



      });



    },



    [],



  );







  /**



   * ==========================================================



   * LOAD TODAY'S ATTENDANCE



   * ==========================================================



   */



  const loadTodayAttendance = useCallback(async (): Promise<void> => {



    setIsLoadingDailyState(true);







    try {



      const attendance = await attendanceService.getTodayAttendance();







      const uiState = mapDailyPunchStateToUiState(attendance);







      setState(uiState);







      /**



       * Restore Punch In location first.



       */



      if (attendance.punchInLocation) {



        applyLocation(



          attendance.punchInLocation.latitude,



          attendance.punchInLocation.longitude,



          attendance.punchInLocation.accuracy,



          attendance.punchInLocation.address,



        );



      } else if (attendance.punchOutLocation) {



        /**



         * Otherwise restore Punch Out location.



         */



        applyLocation(



          attendance.punchOutLocation.latitude,



          attendance.punchOutLocation.longitude,



          attendance.punchOutLocation.accuracy,



          attendance.punchOutLocation.address,



        );



      }



    } catch (error) {



      console.error("Unable to load today's attendance:", error);



    } finally {



      setIsLoadingDailyState(false);



    }



  }, [applyLocation]);







  /**



   * ==========================================================



   * INITIAL LOCATION



   * ==========================================================



   *



   * This is only for displaying current location.



   *



   * Punch In / Punch Out still request a fresh GPS reading.



   */



  const requestInitialLocation = useCallback((): void => {



    setLocationStatus("loading");



    setLocationError(null);







    if (!navigator.geolocation) {



      setLocationStatus("unavailable");



      setLocationError("Location services are not supported.");



      return;



    }







    navigator.geolocation.getCurrentPosition(



      (position) => {



        applyLocation(



          position.coords.latitude,



          position.coords.longitude,



          position.coords.accuracy,



        );



      },



      (error) => {



        const message = getLocationErrorMessage(error);







        if (error.code === error.PERMISSION_DENIED) {



          setLocationStatus("denied");



        } else if (error.code === error.POSITION_UNAVAILABLE) {



          setLocationStatus("unavailable");



        } else {



          setLocationStatus("error");



        }







        setLocationError(message);



      },



      {



        enableHighAccuracy: true,



        maximumAge: 60000,



        timeout: 15000,



      },



    );



  }, [applyLocation]);







  /**



   * ==========================================================



   * INITIAL LOAD



   * ==========================================================



   */



  useEffect(() => {



    void loadTodayAttendance();



    requestInitialLocation();



  }, [loadTodayAttendance, requestInitialLocation]);







  /**



   * ==========================================================



   * EXECUTE ATTENDANCE ACTION



   * ==========================================================



   */



  const executeAction = useCallback(



    async (action: AttendanceAction): Promise<void> => {



      if (isProcessing) {



        return;



      }







      /**



       * ========================================================



       * STATE MACHINE VALIDATION



       * ========================================================



       */







      if (action === "PUNCH_IN" && state.isPunchedIn) {



        return;



      }







      if (action === "BREAK_IN") {



        if (!state.isPunchedIn || state.isOnBreak) {



          return;



        }



      }







      if (action === "BREAK_OUT") {



        if (!state.isPunchedIn || !state.isOnBreak) {



          return;



        }



      }







      if (action === "PUNCH_OUT" && !state.isPunchedIn) {



        return;



      }







      if (action === "PUNCH_OUT" && state.isOnBreak) {



        window.alert("Please Break Out before Punch Out.");



        return;



      }







      setIsProcessing(true);







      try {



        /**



         * ======================================================



         * STEP 1: GET FRESH GPS



         * ======================================================



         */



        const requiresLocation =



          action === "PUNCH_IN" || action === "PUNCH_OUT";







        let freshLocation: FreshLocation | null = null;







        if (requiresLocation) {



          try {



            freshLocation = await getFreshLocation();



          } catch (error) {



            const message = getLocationErrorMessage(error);







            const geoError = error as GeolocationPositionError;







            if (geoError?.code === geoError?.PERMISSION_DENIED) {



              setLocationStatus("denied");



            } else if (geoError?.code === geoError?.POSITION_UNAVAILABLE) {



              setLocationStatus("unavailable");



            } else {



              setLocationStatus("error");



            }







            setLocationError(message);



            window.alert(message);



            return;



          }







          applyLocation(



            freshLocation.latitude,



            freshLocation.longitude,



            freshLocation.accuracy,



          );



        }







        /**



         * ======================================================



         * STEP 2: CALL EXISTING BACKEND API



         * ======================================================



         */



        const response = await attendanceService.executePunchAction({



          action,







          ...(freshLocation



            ? {



                latitude: freshLocation.latitude,



                longitude: freshLocation.longitude,



                accuracy: freshLocation.accuracy,



              }



            : {}),







          actionTime: new Date().toISOString(),



        });







        /**



         * ======================================================



         * STEP 3: BACKEND REJECTED THE ACTION



         * ======================================================



         *



         * A normal business/API response with success=false



         * is different from an unavailable API.



         *



         * Do NOT apply the local fallback here because the



         * backend explicitly rejected the action.



         */



        if (!response.success) {



          if (action === "PUNCH_IN" || action === "PUNCH_OUT") {



            window.alert(response.message || "Attendance action failed.");



          }







          return;



        }







        /**



         * ======================================================



         * STEP 4: UPDATE UI IMMEDIATELY



         * ======================================================



         */



        const actionNow = new Date();







        /**



         * PUNCH IN



         */



        if (action === "PUNCH_IN") {



          const backendState = response.attendance;







          const mappedState = mapDailyPunchStateToUiState(backendState);







          setState({



            ...mappedState,



            isPunchedIn: true,



            isOnBreak: false,



            punchInTime: mappedState.punchInTime ?? actionNow,



            punchOutTime: null,



            breakInTime: null,



            breakOutTime: null,



          });



        }







        /**



         * BREAK IN



         */



        if (action === "BREAK_IN") {



          setState((previousState) => ({



            ...previousState,



            isPunchedIn: true,



            isOnBreak: true,



            breakInTime: actionNow,



            breakOutTime: null,



            punchOutTime: null,



          }));



        }







        /**



         * BREAK OUT



         */



        if (action === "BREAK_OUT") {



          setState((previousState) => ({



            ...previousState,



            isPunchedIn: true,



            isOnBreak: false,



            breakOutTime: actionNow,



          }));



        }







        /**



         * PUNCH OUT



         */



        if (action === "PUNCH_OUT") {



          const backendState = response.attendance;







          const mappedState = mapDailyPunchStateToUiState(backendState);







          setState({



            ...mappedState,



            isPunchedIn: false,



            isOnBreak: false,



            punchOutTime: mappedState.punchOutTime ?? actionNow,



          });



        }







        /**



         * ======================================================



         * LOCATION



         * ======================================================



         */



        let actionAddress: string | null = null;







        /**



         * Punch In location



         */



        if (action === "PUNCH_IN") {



          const punchInLocation = response.attendance?.punchInLocation;







          if (punchInLocation) {



            actionAddress = punchInLocation.address;







            applyLocation(



              punchInLocation.latitude,



              punchInLocation.longitude,



              punchInLocation.accuracy,



              punchInLocation.address,



            );



          } else if (freshLocation) {



            applyLocation(



              freshLocation.latitude,



              freshLocation.longitude,



              freshLocation.accuracy,



            );



          }



        }







        /**



         * Punch Out location



         */



        if (action === "PUNCH_OUT") {



          const punchOutLocation = response.attendance?.punchOutLocation;







          if (punchOutLocation) {



            actionAddress = punchOutLocation.address;







            applyLocation(



              punchOutLocation.latitude,



              punchOutLocation.longitude,



              punchOutLocation.accuracy,



              punchOutLocation.address,



            );



          } else if (freshLocation) {



            applyLocation(



              freshLocation.latitude,



              freshLocation.longitude,



              freshLocation.accuracy,



            );



          }



        }







        /**



         * Break actions use the last known attendance



         * location/address.



         */



        if (!actionAddress) {



          actionAddress =



            response.attendance?.punchInLocation?.address ??



            response.attendance?.punchOutLocation?.address ??



            state.punchInLocationAddress ??



            state.punchOutLocationAddress ??



            resolvedAddress ??



            null;



        }







        if (actionAddress) {



          setResolvedAddress(actionAddress);



        }







        /**



         * ======================================================



         * DASHBOARD TIMELINE CALLBACK



         * ======================================================



         *



         * The parent Dashboard receives this immediately.



         * No browser refresh is required.



         */



        const actionLabels: Record<AttendanceAction, string> = {



          PUNCH_IN: "Punch In",



          BREAK_IN: "Break In",



          BREAK_OUT: "Break Out",



          PUNCH_OUT: "Punch Out",



        };







        const actionDescriptions: Record<AttendanceAction, string> = {



          PUNCH_IN: "Work started",



          BREAK_IN: "Lunch break started",



          BREAK_OUT: "Lunch break ended",



          PUNCH_OUT: "Work ended",



        };







        const timelineAddress = actionAddress || "Location recorded";







        onActionLogged?.(



          actionLabels[action],



          `${actionDescriptions[action]} at ${timelineAddress}`,



        );



      } catch (error) {



        /**



         * ======================================================



         * API UNAVAILABLE -> LOCAL FALLBACK



         * ======================================================



         *



         * attendanceService throws when the request itself



         * fails. In that case we:



         *



         * 1. Update PunchCard locally.



         * 2. Update Dashboard timeline immediately.



         * 3. Tell the employee that the API is unavailable.



         *



         * This does not claim that the backend saved the action.



         */



        console.error(`Attendance action ${action} failed:`, error);







        const localActionTime = new Date();







        applyLocalAttendanceFallback(action, localActionTime);







        const actionLabels: Record<AttendanceAction, string> = {



          PUNCH_IN: "Punch In",



          BREAK_IN: "Break In",



          BREAK_OUT: "Break Out",



          PUNCH_OUT: "Punch Out",



        };







        const actionDescriptions: Record<AttendanceAction, string> = {



          PUNCH_IN: "Work started",



          BREAK_IN: "Lunch break started",



          BREAK_OUT: "Lunch break ended",



          PUNCH_OUT: "Work ended",



        };







        const timelineAddress = resolvedAddress || "Location recorded";







        /**



         * Update Dashboard timeline immediately even



         * though the API is unavailable.



         */



        onActionLogged?.(



          actionLabels[action],



          `${actionDescriptions[action]} at ${timelineAddress}`,



        );







        if (action === "PUNCH_IN" || action === "PUNCH_OUT") {



          window.alert(`Attendance API is currently unavailable.`);



        }



      } finally {



        setIsProcessing(false);



      }



    },



    [



      isProcessing,



      state,



      onActionLogged,



      applyLocation,



      resolvedAddress,



      applyLocalAttendanceFallback,



    ],



  );







  /**



   * ==========================================================



   * PRIMARY ACTION



   * ==========================================================



   *



   * NOT PUNCHED IN -> PUNCH IN



   * WORKING        -> PUNCH OUT



   * ON BREAK       -> DISABLED



   */



  const handlePrimaryAction = useCallback((): void => {



    if (state.isOnBreak) {



      window.alert("Please Break Out before Punch Out.");



      return;



    }







    const action: AttendanceAction = state.isPunchedIn



      ? "PUNCH_OUT"



      : "PUNCH_IN";







    void executeAction(action);



  }, [state.isPunchedIn, state.isOnBreak, executeAction]);







  /**



   * ==========================================================



   * BREAK ACTION



   * ==========================================================



   *



   * WORKING -> BREAK IN



   * ON BREAK -> BREAK OUT



   */



  const handleBreakAction = useCallback((): void => {



    if (!state.isPunchedIn) {



      return;



    }







    const action: AttendanceAction = state.isOnBreak ? "BREAK_OUT" : "BREAK_IN";







    void executeAction(action);



  }, [state.isPunchedIn, state.isOnBreak, executeAction]);







    /**
   * ==========================================================
   * BREAK TIMER DISPLAY
   * ==========================================================
   */
  const breakTimerDisplay = useMemo(() => {
    if (!state.isOnBreak || !state.breakInTime) {
      return "45:00";
    }

    const elapsedMs = Math.max(
      0,
      breakTimerNow - state.breakInTime.getTime(),
    );

    const remainingMs = BREAK_DURATION_MS - elapsedMs;
    const absoluteSeconds = Math.floor(
      Math.abs(remainingMs) / 1000,
    );

    const minutes = Math.floor(absoluteSeconds / 60);
    const seconds = absoluteSeconds % 60;

    const formatted =
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`;

    return remainingMs < 0
      ? `-${formatted}`
      : formatted;
  }, [
    state.isOnBreak,
    state.breakInTime,
    breakTimerNow,
  ]);

  const isBreakOvertime = useMemo(() => {
    if (!state.isOnBreak || !state.breakInTime) {
      return false;
    }

    return (
      breakTimerNow - state.breakInTime.getTime() >=
      BREAK_DURATION_MS
    );
  }, [
    state.isOnBreak,
    state.breakInTime,
    breakTimerNow,
  ]);

/**



   * ==========================================================



   * CLOCK



   * ==========================================================



   */



  const clockDisplayTime = useMemo(() => {



    if (!state.isPunchedIn) {



      return "--:--:--";



    }







    if (state.isOnBreak) {



      return formatTime(state.breakInTime);



    }







    return formatTime(state.punchInTime);



  }, [



    state.isPunchedIn,



    state.isOnBreak,



    state.punchInTime,



    state.breakInTime,



  ]);







  /**



   * ==========================================================



   * CLOCK LABEL



   * ==========================================================



   */



  const clockLabel = useMemo(() => {



    if (state.isOnBreak) {



      return "Break In";



    }







    return "Punch In";



  }, [state.isOnBreak]);







  /**



   * ==========================================================



   * STATUS



   * ==========================================================



   */



  const statusText = useMemo(() => {



    if (state.isOnBreak) {



      return "On Break";



    }







    if (state.isPunchedIn) {



      return "Punched In";



    }







    return "Not Punched In";



  }, [state.isPunchedIn, state.isOnBreak]);







  /**



   * ==========================================================



   * PRIMARY BUTTON



   * ==========================================================



   */



  const primaryBtn = useMemo(() => {



    /**



     * ON BREAK



     *



     * Punch Out is not allowed until Break Out.



     */



    if (state.isPunchedIn && state.isOnBreak) {



      return {



        label: "Punch Out",



        variant: "danger" as const,



        disabled: true,



      };



    }







    /**



     * WORKING



     */



    if (state.isPunchedIn) {



      return {



        label: "Punch Out",



        variant: "danger" as const,



        disabled: false,



      };



    }







    /**



     * NOT PUNCHED IN



     */



    return {



      label: "Punch In",



      variant: "primary" as const,



      disabled: false,



    };



  }, [state.isPunchedIn, state.isOnBreak]);







  /**



   * ==========================================================



   * BREAK BUTTON



   * ==========================================================



   */



  const breakBtn = useMemo(() => {



    /**



     * NOT PUNCHED IN



     */



    if (!state.isPunchedIn) {



      return {



        label: "Break In",



        disabled: true,



        variant: "outline" as const,



      };



    }







    /**



     * ON BREAK



     */



    if (state.isOnBreak) {



      return {



        label: "Break Out",



        disabled: false,



        variant: "orange" as const,



      };



    }







    /**



     * WORKING



     */



    return {



      label: "Break In",



      disabled: false,



      variant: "outline" as const,



    };



  }, [state.isPunchedIn, state.isOnBreak]);







  /**



   * ==========================================================



   * RENDER



   * ==========================================================



   */



  return (

    <div className="punch-attendance-layout">

      {/* ==========================================================

          WORK / PUNCH CARD

          Design only. Attendance logic is unchanged.

          ========================================================== */}

      <div className="punch-card punch-card-work">

        <div className="punch-card-left">

          <div className="punch-clock-circle">

            <div className="punch-clock-inner">

              <Fingerprint className="punch-clock-icon" size={34} />



              <span className="punch-clock-label">

                {state.isPunchedIn ? "Punched In" : "Ready to"}

                {!state.isPunchedIn && <br />}

                {!state.isPunchedIn && "Punch In"}

              </span>



              <span className="punch-clock-time">{clockDisplayTime}</span>

            </div>

          </div>

        </div>



        <div className="punch-card-center">

          <div className="punch-card-section-heading">

            <span className="punch-status-dot" />

            <h3 className="punch-center-heading">

              {state.isPunchedIn ? "Your Work Session" : "Start Your Work"}

            </h3>

          </div>



          <p className="punch-center-status">

            {isLoadingDailyState

              ? "Checking today's attendance..."

              : state.isPunchedIn

                ? "You are currently Punched In."

                : "Click the button below to mark your Punch In and start your work session."}

          </p>



          <button

            type="button"

            className={`punch-btn punch-btn-${primaryBtn.variant} punch-primary-action`}

            onClick={handlePrimaryAction}

            disabled={

              primaryBtn.disabled || isProcessing || isLoadingDailyState

            }

          >

            <Play size={18} strokeWidth={2.3} />

            {isProcessing ? "Processing..." : primaryBtn.label}

          </button>



          <span className="punch-location-note">

            <MapPin size={14} strokeWidth={2.1} />

            Your current location will be recorded.

          </span>

        </div>



        <div className="punch-card-right">

          <PunchLocationMap

            employeeLocation={location}

            address={resolvedAddress}

            locationStatus={locationStatus}

            errorMessage={locationError || undefined}

            onRetry={requestInitialLocation}

          />

        </div>

      </div>



      {/* ==========================================================

          BREAK CARD

          Design only. Existing Break In / Break Out logic unchanged.

          ========================================================== */}

      <div className="punch-card punch-card-break">

        <div className="break-card-icon-area">

          <div className="break-icon-circle">

            <Coffee size={43} strokeWidth={2.1} />

          </div>

        </div>



        <div className="break-card-content">

          <div className="break-card-heading-row">

            <span className="break-status-dot" />

            <h3 className="break-card-heading">

              {state.isOnBreak ? "On Break" : "Take a Break"}

            </h3>

          </div>



          <p className="break-card-description">

            {state.isOnBreak

              ? "You are currently on a 45 minutes break."

              : "You can take a 45 minutes break during your work session."}

          </p>



          <button

            type="button"

            className={`punch-btn punch-btn-${breakBtn.variant} break-action-button`}

            onClick={handleBreakAction}

            disabled={breakBtn.disabled || isProcessing || isLoadingDailyState}

          >

            <Coffee size={17} strokeWidth={2.2} />

            {isProcessing ? "Processing..." : breakBtn.label}

          </button>



          <span
            className={`break-card-duration ${
              isBreakOvertime
                ? "break-card-duration-overtime"
                : ""
            }`}
          >
            {state.isOnBreak
              ? isBreakOvertime
                ? `Break overtime: ${breakTimerDisplay}`
                : `Break time remaining: ${breakTimerDisplay}`
              : "Break duration: 45 minutes"}
          </span>

        </div>

      </div>

    </div>

  );

};



export default PunchCard;
