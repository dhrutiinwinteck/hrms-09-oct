import type { ProfileData } from "../types/profile.types.ts";

export const PROFILE_DATA: ProfileData = {
  name: "Rahul Sharma",
  initials: "RS",
  designation: "Software Engineer",
  employeeId: "EMP00123",
  dateOfJoining: "18 Aug 2026",
  workLocation: "Mumbai, India",
  status: "Active",

  summary: [
    {
      label: "Work Email",
      value: "rahul.sharma@company.com",
      icon: "mail",
    },
    {
      label: "Phone",
      value: "+91 9876543210",
      icon: "phone",
    },
    {
      label: "Designation",
      value: "Software Engineer",
      icon: "briefcase",
    },
    {
      label: "Department",
      value: "IT - Development",
      icon: "building",
    },
    {
      label: "Reports To",
      value: "Amit Patel",
      icon: "user",
    },
    {
      label: "Gender",
      value: "Male",
      icon: "gender",
    },
  ],

  personalInformation: [
    {
      label: "Date of Birth",
      value: "15 Jan 1995",
    },
    {
      label: "Nationality",
      value: "Indian",
    },
    {
      label: "Marital Status",
      value: "Single",
    },
    {
      label: "Blood Group",
      value: "O+",
    },
    {
      label: "Address",
      value: "123, Green Street, Mumbai, Maharashtra - 400001",
    },
  ],

  emergencyContact: [
    {
      label: "Contact Name",
      value: "Ramesh Sharma",
    },
    {
      label: "Relationship",
      value: "Father",
    },
    {
      label: "Phone",
      value: "+91 9123456780",
    },
    {
      label: "Alternate Phone",
      value: "+91 9988776655",
    },
    {
      label: "Address",
      value: "123, Green Street, Mumbai, Maharashtra - 400001",
    },
  ],

  workInformation: [
    {
      label: "Phone",
      value: "+91 9876543210",
    },
    {
      label: "Email",
      value: "rahul.sharma@company.com",
    },
    {
      label: "Designation",
      value: "Software Engineer",
    },
    {
      label: "Department",
      value: "IT - Development",
    },
    {
      label: "Reports To",
      value: "Amit Patel",
    },
    {
      label: "Gender",
      value: "Male",
    },
  ],

  bankInformation: [
    {
      label: "Bank Name",
      value: "HDFC Bank",
    },
    {
      label: "Account Number",
      value: "502004568790",
    },
    {
      label: "IFSC Code",
      value: "HDFC0001234",
    },
    {
      label: "Account Type",
      value: "Savings",
    },
    {
      label: "Branch",
      value: "Andheri (E), Mumbai",
    },
  ],

  familyInformation: [
    {
      name: "Ramesh Sharma",
      relationship: "Father",
      dateOfBirth: "10 Feb 1975",
      occupation: "Business",
    },
    {
      name: "Savita Sharma",
      relationship: "Mother",
      dateOfBirth: "12 Mar 1980",
      occupation: "Homemaker",
    },
    {
      name: "Priyansh Sharma",
      relationship: "Brother",
      dateOfBirth: "20 Jul 2000",
      occupation: "Student",
    },
  ],

  educationInformation: [
    {
      degree: "B.Tech (CS)",
      institution: "Mumbai University",
      yearOfPassing: "2017",
      percentage: "72%",
    },
    {
      degree: "HSC",
      institution: "Maharashtra Board",
      yearOfPassing: "2013",
      percentage: "68%",
    },
    {
      degree: "SSC",
      institution: "Maharashtra Board",
      yearOfPassing: "2011",
      percentage: "75%",
    },
  ],

  experienceInformation: [
    {
      company: "ABC Solutions Pvt. Ltd.",
      designation: "Software Engineer",
      from: "Jun 2021",
      to: "Present",
      totalExperience: "3 Yrs 2 M",
    },
    {
      company: "XYZ Technologies",
      designation: "Junior Developer",
      from: "Jul 2019",
      to: "May 2021",
      totalExperience: "1 Yr 10 M",
    },
  ],
};