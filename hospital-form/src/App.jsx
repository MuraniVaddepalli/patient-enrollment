import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./App.css";
import logo from "../public/logo.png";
function App() {
  const sigRef = useRef();
  const today = new Date().toISOString().split("T")[0];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    // genderOther: "",
    dob: "",
    anniversary: "",
    age: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    mobile: "",
    alternateMobile: "",
    email: "",

    purpose: "",
    purposeOther: "",

    diagnosisDuration: "",
    diagnosisDurationOther: "",

    doctorName: "",
    doctorQualification: "",
    doctorQualificationOther: "",

    referenceSource: "",
    referredDoctorName: "",
    referenceOther: "",

    consent: false,
    date: today
  });

//   useEffect(() => {
//   const today = new Date().toISOString().split("T")[0];
//   setFormData((prev) => ({
//     ...prev,
//     date: today
//   }));
// }, []);

  const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  let newValue = value;

  // ✅ Mobile validation (numbers only, max 10 digits)
  if (name === "mobile" || name === "alternateMobile") {
    newValue = value.replace(/\D/g, "").slice(0, 10);
  }

  // ✅ Age should not be negative
  if (name === "age") {
    newValue = value < 0 ? "" : value;
  }

  // ✅ Capitalize first letter of each word
  if (
    ["firstName", "lastName", "city", "state", "address", "doctorName"].includes(name)
  ) {
    newValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  setFormData({
    ...formData,
    [name]: type === "checkbox" ? checked : newValue
  });

  if (errors[name]) {
    setErrors({ ...errors, [name]: "" });
  }
};
  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    // if (formData.gender === "Other" && !formData.genderOther.trim())
    //   newErrors.genderOther = "Please specify gender";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";
    if (!formData.purpose) newErrors.purpose = "Purpose of visit is required";
    if (formData.purpose === "Other" && !formData.purposeOther.trim())
      newErrors.purposeOther = "Please specify purpose";
    if (!formData.diagnosisDuration) newErrors.diagnosisDuration = "Duration is required";
    if (formData.diagnosisDuration === "Other" && !formData.diagnosisDurationOther.trim())
      newErrors.diagnosisDurationOther = "Please specify duration";
    if (!formData.doctorName.trim()) newErrors.doctorName = "Doctor name is required";
    if (!formData.doctorQualification) newErrors.doctorQualification = "Qualification is required";
    if (formData.doctorQualification === "Other" && !formData.doctorQualificationOther.trim())
      newErrors.doctorQualificationOther = "Please specify qualification";
    if (!formData.referenceSource) newErrors.referenceSource = "Reference source is required";
    if (formData.referenceSource === "Referred by Doctor" && !formData.referredDoctorName.trim())
      newErrors.referredDoctorName = "Please enter doctor name";
    if (formData.referenceSource === "Other" && !formData.referenceOther.trim())
      newErrors.referenceOther = "Please specify";
    if (!formData.consent) newErrors.consent = "Consent is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (sigRef.current && sigRef.current.isEmpty()) newErrors.signature = "Signature is required";

    // email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }


    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
  newErrors.pincode = "Pincode must be 6 digits";
}

    // Mobile validation (10 digits)
if (!/^\d{10}$/.test(formData.mobile)) {
  newErrors.mobile = "Mobile must be 10 digits";
}

// Alternate mobile (optional but if given must be valid)
if (formData.alternateMobile && !/^\d{10}$/.test(formData.alternateMobile)) {
  newErrors.alternateMobile = "Alternate mobile must be 10 digits";
}

// Age validation
if (formData.age && formData.age < 0) {
  newErrors.age = "Age cannot be negative";
}

// Email validation (already good, keep it)
if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
  newErrors.email = "Invalid email address";
}

if (formData.dob > today) {
  newErrors.dob = "Future date not allowed";
}

    return newErrors;
  };

  

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;
setIsSubmitting(true);

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const signature = sigRef.current.toDataURL();
  const finalData = { ...formData, signature };

  try {
    const response = await fetch("https://patient-enrollment.onrender.com/api/save-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(finalData)
    });

    const result = await response.json();

    // ✅ IMPORTANT FIX
    if (!response.ok) {
      throw new Error(result.error || "Something went wrong");
    }

    console.log("Success:", result);

    // RESET FORM
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      // genderOther: "",
      dob: "",
      anniversary: "",
      age: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      mobile: "",
      alternateMobile: "",
      email: "",
      purpose: "",
      purposeOther: "",
      diagnosisDuration: "",
      diagnosisDurationOther: "",
      doctorName: "",
      doctorQualification: "",
      doctorQualificationOther: "",
      referenceSource: "",
      referredDoctorName: "",
      referenceOther: "",
      consent: false,
      date: today
    });

    sigRef.current.clear();
    setErrors({});

    alert("Form submitted successfully!");

  } catch (error) {
    console.error("Frontend Error:", error.message);
    alert(error.message);
  }
  finally{
    setIsSubmitting(false);
  }
};


const inputProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    "data-error": errors[name] ? "true" : undefined
  });

  return (
    <div className="container">
      <header className="form-header">
<div className="logo-mark">
  <img src={logo} alt="Clinic Logo" />
</div>        <h1>Sugar &amp; Heart Clinic</h1>
        <p className="subtitle">Patient Enrollment Form</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        {/* Patient Information */}
        <section className="form-section">
          <h3>Patient Information</h3>
          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="firstName">Patient First Name <span className="required">*</span></label>
              <input id="firstName" placeholder="Enter first name" {...inputProps("firstName")} />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="lastName">Patient Last Name <span className="required">*</span></label>
              <input id="lastName" placeholder="Enter last name" {...inputProps("lastName")} />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="gender">Gender <span className="required">*</span></label>
              <select id="gender" {...inputProps("gender")}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
              {/* {formData.gender === "Other" && (
                <input
                  name="genderOther"
                  placeholder="Specify gender"
                  value={formData.genderOther}
                  onChange={handleChange}
                  className="other-input"
                />
              )} */}
              {/* {errors.genderOther && <span className="error-text">{errors.genderOther}</span>} */}
            </div>

            <div className="field-group">
              <label htmlFor="dob">Date of Birth <span className="required">*</span></label>
              <input id="dob" type="date" max={today} {...inputProps("dob")} />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" placeholder="Years" min="0" max="150" {...inputProps("age")} />
            </div>

            <div className="field-group">
              <label htmlFor="anniversary">Anniversary Date</label>
              <input id="anniversary" type="date" max={today} {...inputProps("anniversary")} />
            </div>

            <div className="field-group full-width">
              <label htmlFor="address">Address</label>
              <input id="address" placeholder="Street address" {...inputProps("address")} />
            </div>

            <div className="field-group">
              <label htmlFor="city">City</label>
              <input id="city" placeholder="City" {...inputProps("city")} />
            </div>

            <div className="field-group">
              <label htmlFor="state">State</label>
              <input id="state" placeholder="State" {...inputProps("state")} />
            </div>

            <div className="field-group">
              <label htmlFor="pincode">Pin Code</label>
              <input id="pincode" placeholder="000000" {...inputProps("pincode")} />
            </div>
          </div>
        </section>

        {/* Contact Details */}
        <section className="form-section">
          <h3>Contact Details</h3>
          <div className="form-grid two-col">
            <div className="field-group">
              <label htmlFor="mobile">Mobile <span className="required">*</span></label>
              <input id="mobile" maxLength='10' type="tel" placeholder="+91 98765 43210" {...inputProps("mobile")} />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="alternateMobile">Alternate Mobile</label>
              <input id="alternateMobile" maxLength='10' type="tel" placeholder="+91 98765 43210" {...inputProps("alternateMobile")} />
            </div>
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="patient@example.com" {...inputProps("email")} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>
        </section>

        {/* Purpose of Visit */}
        <section className="form-section">
          <h3>Purpose of Visit</h3>
          <div className="form-grid two-col">
            <div className="field-group">
              <label htmlFor="purpose">Purpose of Visit <span className="required">*</span></label>
              <select id="purpose" {...inputProps("purpose")}>
                <option value="">Select</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Weight loss">Weight loss</option>
                <option value="Heart">Heart</option>
                <option value="Other">Other</option>
              </select>
              {errors.purpose && <span className="error-text">{errors.purpose}</span>}
              {formData.purpose === "Other" && (
                <input name="purposeOther" placeholder="Specify purpose" value={formData.purposeOther} onChange={handleChange} className="other-input" />
              )}
              {errors.purposeOther && <span className="error-text">{errors.purposeOther}</span>}
            </div>
          </div>
        </section>

        {/* Diagnosis Duration */}
        <section className="form-section">
          <h3>Diagnosis History</h3>
          <div className="field-group">
            <label>Since when have you been diagnosed with the above disorder? <span className="required">*</span></label>
            <div className="radio-group">
              {[
                "Less than 3 months",
                "3–6 months",
                "6–12 months",
                "1–3 years",
                "3–5 years",
                "More than 5 years",
                "Other"
              ].map((option) => (
                <label key={option} className="radio-option">
                  <input type="radio" name="diagnosisDuration" value={option} checked={formData.diagnosisDuration === option} onChange={handleChange} />
                  {option}
                </label>
              ))}
            </div>
            {errors.diagnosisDuration && <span className="error-text">{errors.diagnosisDuration}</span>}
            {formData.diagnosisDuration === "Other" && (
              <input name="diagnosisDurationOther" placeholder="Please specify" value={formData.diagnosisDurationOther} onChange={handleChange} className="other-input" />
            )}
            {errors.diagnosisDurationOther && <span className="error-text">{errors.diagnosisDurationOther}</span>}
          </div>
        </section>

        {/* Doctor Information */}
        <section className="form-section">
          <h3>Previous / Current Doctor Information</h3>
          <div className="form-grid">
            <div className="field-group full-width">
              <label htmlFor="doctorName">Doctor Name <span className="required">*</span></label>
              <input id="doctorName" placeholder="Enter doctor name" {...inputProps("doctorName")} />
              {errors.doctorName && <span className="error-text">{errors.doctorName}</span>}
            </div>
            <div className="field-group full-width">
              <label>Doctor Qualification <span className="required">*</span></label>
              <div className="radio-group">
                {["General Physician", "Consultation Specialist", "Super Specialist", "Other"].map((option) => (
                  <label key={option} className="radio-option">
                    <input type="radio" name="doctorQualification" value={option} checked={formData.doctorQualification === option} onChange={handleChange} />
                    {option}
                  </label>
                ))}
              </div>
              {errors.doctorQualification && <span className="error-text">{errors.doctorQualification}</span>}
              {formData.doctorQualification === "Other" && (
                <input name="doctorQualificationOther" placeholder="Please specify" value={formData.doctorQualificationOther} onChange={handleChange} className="other-input" />
              )}
              {errors.doctorQualificationOther && <span className="error-text">{errors.doctorQualificationOther}</span>}
            </div>
          </div>
        </section>

        {/* Reference Source */}
        <section className="form-section">
          <h3>Referral Information</h3>
          <div className="field-group">
            <p className="field-question">
              How did you come to know about our clinic?
              <span className="required"> *</span>
            </p>
            <div className="radio-group">
              {[
                "Physical Ads",
                "Digital Ads or Social Media",
                "Referred by Family or Friends",
                "Referred by Doctor",
                "Other"
              ].map((option) => (
                <label key={option} className="radio-option">
                  <input type="radio" name="referenceSource" value={option} checked={formData.referenceSource === option} onChange={handleChange} />
                  {option}
                </label>
              ))}
            </div>
            {errors.referenceSource && <span className="error-text">{errors.referenceSource}</span>}
            {formData.referenceSource === "Referred by Doctor" && (
              <input name="referredDoctorName" placeholder="Enter doctor name" value={formData.referredDoctorName} onChange={handleChange} className="other-input" />
            )}
            {errors.referredDoctorName && <span className="error-text">{errors.referredDoctorName}</span>}
            {formData.referenceSource === "Other" && (
              <input name="referenceOther" placeholder="Please specify" value={formData.referenceOther} onChange={handleChange} className="other-input" />
            )}
            {errors.referenceOther && <span className="error-text">{errors.referenceOther}</span>}
          </div>
        </section>

        {/* Consent */}
        <section className="form-section">
          <h3>Consent &amp; Acknowledgment</h3>
          <div className="consent-box">
            <p>
              I hereby consent to receive medical care and treatment from Sugar &amp;
              Heart Clinic. I understand that the information provided above will be
              used for my healthcare records and treatment purposes.
            </p>
            <label className="checkbox-label">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} />
              <span className="checkmark"></span>
              I agree to the above terms and consent to treatment.
            </label>
            {errors.consent && <span className="error-text">{errors.consent}</span>}
          </div>
        </section>

        {/* Signature & Date */}
        <section className="form-section">
          <h3>Signature &amp; Date</h3>
          <div className="signature-wrap">
            <div className="signature-canvas-box" data-error={errors.signature ? "true" : undefined}>
              <span className="sig-hint">Sign inside the box</span>
              <SignatureCanvas
                ref={sigRef}
                penColor="#1e293b"
                canvasProps={{ className: "sigCanvas" }}
              />
              <button type="button" className="clear-sig" onClick={() => sigRef.current.clear()}>
                Clear Signature
              </button>
              {errors.signature && <span className="error-text">{errors.signature}</span>}
            </div>
            <div className="field-group date-field">
              <label htmlFor="date">Date <span className="required">*</span></label>
              <input id="date" type="date" {...inputProps("date")} readOnly />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>
        </section>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Enrollment"}
        </button>
      </form>
    </div>
  );
}


export default App;

