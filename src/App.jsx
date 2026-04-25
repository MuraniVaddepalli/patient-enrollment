import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import "./App.css";

function App() {
  const sigRef = useRef();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    genderOther: "",
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
    date: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (formData.gender === "Other" && !formData.genderOther.trim())
      newErrors.genderOther = "Please specify gender";
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

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // scroll to first error
      const firstErrorField = document.querySelector("[data-error='true']");
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const signature = sigRef.current.toDataURL();
    const finalData = { ...formData, signature };
    console.log(finalData);

    // reset form
    setFormData({
      firstName: "",
      lastName: "",
      gender: "",
      genderOther: "",
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
      date: ""
    });
    sigRef.current.clear();
    setErrors({});
    alert("Form submitted successfully!");
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
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#14b8a6"/>
          </svg>
        </div>
        <h1>Sugar &amp; Heart Clinic</h1>
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
              {formData.gender === "Other" && (
                <input
                  name="genderOther"
                  placeholder="Specify gender"
                  value={formData.genderOther}
                  onChange={handleChange}
                  className="other-input"
                />
              )}
              {errors.genderOther && <span className="error-text">{errors.genderOther}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="dob">Date of Birth <span className="required">*</span></label>
              <input id="dob" type="date" {...inputProps("dob")} />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="age">Age</label>
              <input id="age" type="number" placeholder="Years" min="0" max="150" {...inputProps("age")} />
            </div>

            <div className="field-group">
              <label htmlFor="anniversary">Anniversary Date</label>
              <input id="anniversary" type="date" {...inputProps("anniversary")} />
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
              <input id="mobile" type="tel" placeholder="+91 98765 43210" {...inputProps("mobile")} />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="alternateMobile">Alternate Mobile</label>
              <input id="alternateMobile" type="tel" placeholder="+91 98765 43210" {...inputProps("alternateMobile")} />
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
              <input id="date" type="date" {...inputProps("date")} />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>
        </section>

        <button type="submit" className="submit-btn">
          Submit Enrollment
        </button>
      </form>
    </div>
  );
}

export default App;

