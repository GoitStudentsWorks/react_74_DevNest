import { useDispatch } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import s from "./TransactionForm.module.css";
import {
  transactionChangeInfo,
  transactionPost,
} from "../../redux/transactions/operations";

import { useSelector } from "react-redux";
import CategoriesModal from "../CategoriesModal/CategoriesModal";

const validationSchema = Yup.object({
  type: Yup.string()
    .oneOf(["incomes", "expenses"])
    .required("Type is required"),
  date: Yup.date().nullable().required("Date is required"),
  time: Yup.date().nullable().required("Time is required"),
  category: Yup.string().required("Category is required"),
  sum: Yup.number()
    .required("Sum is required")
    .moreThan(0, "Sum must be greater than zero")
    .max(1000000, "Sum must be less than or equal to 1,000,000"),
  comment: Yup.string()
    .required("Comment is required")
    .max(300, "Max 300 characters")
    .trim(),
});

const TransactionForm = ({ transaction, onClose, isModal = false }) => {
  const dispatch = useDispatch();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const incomeCategories = useSelector((state) => state.category.incomes);
  const expenseCategories = useSelector((state) => state.category.expenses);

  const initialValues = transaction
    ? {
        type: transaction.type,
        date: new Date(transaction.date),
        time: new Date(`1970-01-01T${transaction.time}:00`),
        category: transaction.category,
        sum: transaction.sum,
        comment: transaction.comment,
      }
    : {
        type: "expenses",
        date: null,
        time: null,
        category: "",
        sum: "",
        comment: "",
      };

  useEffect(() => {
    if (transaction && transaction.category) {
      const categories =
        transaction.type === "incomes" ? incomeCategories : expenseCategories;

      const matched = categories.find(
        (cat) => cat._id === transaction.category
      );

      if (matched) {
        setSelectedCategoryName(matched.categoryName);
      }
    }
  }, [transaction, incomeCategories, expenseCategories]);

  const handleSubmit = async (values, { resetForm }) => {
    const transactionData = {
      type: values.type,
      date: values.date.toISOString().split("T")[0],
      time: values.time.toTimeString().slice(0, 5),
      category: values.category,
      sum: parseFloat(values.sum),
      comment: values.comment.trim(),
    };

    if (transaction) {
      await toast.promise(
        dispatch(
          transactionChangeInfo({
            type: transaction.type,
            id: transaction._id,
            data: transactionData,
          })
        ).unwrap(),
        {
          loading: "Updating transaction...",
          success: "Transaction successfully updated!",
          error: (error) => error?.message || "Error updating transaction",
        }
      );
    } else {
      await toast.promise(dispatch(transactionPost(transactionData)).unwrap(), {
        loading: "Adding transaction...",
        success: "Transaction successfully added!",
        error: (error) => error?.message || "Error adding transaction",
      });
    }

    resetForm();
    setSelectedCategoryName("");
    onClose();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <>
          <Form className={isModal ? s["edit-form"] : s["add-form"]}>
            <div className={s["t-radio-group"]}>
              <label className={s["t-radio-label"]}>
                <Field
                  type="radio"
                  name="type"
                  value="expenses"
                  checked={values.type === "expenses"}
                  disabled={!!transaction}
                  className={s["t-radio-btn"]}
                />
                Expense
              </label>
              <label className={s["t-radio-label"]}>
                <Field
                  type="radio"
                  name="type"
                  value="incomes"
                  checked={values.type === "incomes"}
                  disabled={!!transaction}
                  className={s["t-radio-btn"]}
                />
                Income
              </label>
              {!transaction && (
                <ErrorMessage name="type" component="div" className={s.error} />
              )}
            </div>
            <div className={s["date-section"]}>
              <div>
                <label className={s["t-label"]}>Date</label>
                <DatePicker
                  selected={values.date}
                  onChange={(date) => setFieldValue("date", date)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="0000-00-00"
                />
                <ErrorMessage
                  name="date"
                  component="div"
                  className={s["t-error"]}
                />
              </div>

              <div>
                <label className={s["t-label"]}>Time</label>
                <DatePicker
                  selected={values.time}
                  onChange={(time) => setFieldValue("time", time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="HH:mm"
                  placeholderText="00:00"
                />
                <ErrorMessage
                  name="time"
                  component="div"
                  className={s["t-error"]}
                />
              </div>
            </div>

            <div className={s["t-input-group"]}>
              <label className={s["t-label"]}>Category</label>
              <Field
                name="category"
                readOnly
                placeholder="Select category"
                value={selectedCategoryName}
                className={s["t-input"]}
                onClick={() => setIsCategoryModalOpen(true)}
              />
              <ErrorMessage
                name="category"
                component="div"
                className={s["t-error"]}
              />
            </div>

            <div className={s["t-input-group"]}>
              <label className={s["t-label"]}>Sum</label>
              <div className={s["t-input-wrapper"]}>
                <Field
                  type="number"
                  name="sum"
                  placeholder="Enter the sum"
                  className={s["t-input"]}
                />
                <span className={s["t-currency"]}>UAH</span>
              </div>
              <ErrorMessage
                name="sum"
                component="div"
                className={s["t-error"]}
              />
            </div>

            <div className={s["t-input-group"]}>
              <label className={s["t-label"]}>Comment</label>
              <Field
                as="textarea"
                name="comment"
                placeholder="Enter the text"
                className={s["t-textarea"]}
              />
              <ErrorMessage
                name="comment"
                component="div"
                className={s["t-error"]}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={s["t-send-btn"]}
            >
              {transaction ? "Save" : "Add"}
            </button>
          </Form>

          {isCategoryModalOpen && (
            <CategoriesModal
              type={values.type}
              onClose={() => setIsCategoryModalOpen(false)}
              onSelectCategory={(category) => {
                setFieldValue("category", category._id);
                setSelectedCategoryName(category.categoryName);
                setIsCategoryModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </Formik>
  );
};

export default TransactionForm;
