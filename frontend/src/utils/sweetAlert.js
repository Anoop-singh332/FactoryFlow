import Swal from "sweetalert2";

/* =====================================================
   COMMON SWEET ALERT
===================================================== */

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#000000",
  });
};


export const showError = (title, text = "") => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#000000",
  });
};


export const showWarning = (title, text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#000000",
  });
};


export const showInfo = (title, text = "") => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#000000",
  });
};


/* =====================================================
   DELETE CONFIRMATION
===================================================== */

export const confirmDelete = async (
  title = "Delete Item?",
  text = "Are you sure you want to delete this item?"
) => {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#000000",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
  });

  return result.isConfirmed;
};