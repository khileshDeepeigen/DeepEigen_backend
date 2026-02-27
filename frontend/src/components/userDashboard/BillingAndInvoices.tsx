import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import type {
  BillingData,
  Invoice,
  PaymentDueData,
  InvoiceRegistrantData,
  PurchasedCourse
} from './data/typesprofile';
import { Link } from 'react-router-dom';
// import { API_BASE } from "./data/api.ts";
import { API_BASE } from "../../utils/api";
import { csrfFetch } from "../../utils/csrfFetch";



interface BillingAndInvoicesProps {
  billingData?: BillingData;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper to format currency
const formatCurrency = (amount: number, currency: string = '$') => {
  return `${currency}${amount.toFixed(2)}`;
};

// Helper to get status indicator
const getStatusBadge = (status: 'paid' | 'pending' | 'failed' | undefined) => {
  const statusConfig = {
    paid: { label: '✓ Paid', color: 'bg-green-100 text-green-700' },
    pending: { label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-700' },
    failed: { label: '✗ Failed', color: 'bg-red-100 text-red-700' },
  };
  const config = statusConfig[status || 'pending'];
  return config;
};

export default function BillingAndInvoices({ billingData }: BillingAndInvoicesProps) {
  const [basicModal, setBasicModal] = useState(false);
  const [customModal, setCustomModal] = useState(false);
  const [purchasedModal, setPurchasedModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [invoiceCheckLoading, setInvoiceCheckLoading] = useState<number | null>(null);

  // API data states
  const [paymentDueData, setPaymentDueData] = useState<PaymentDueData[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any>(null);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceRegistrantData[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Default data in case billingData is not provided

  const defaultBillingData: BillingData = {
    currentPlan: "Basic Plan",
    nextBillingDate: "2024-04-15",
    status: "active",
    invoices: []
  };

  // Use provided billingData or default data
  const data = billingData || defaultBillingData;

  // const data = billingData;

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch payment due data from /accounts/payment_due/
        const paymentDueResponse = await csrfFetch(`${API_BASE}/accounts/payment_due/`, {
          method: "GET",
          credentials: "include",
        });

        let paymentDueJson: any = null;
        if (paymentDueResponse.ok) {
          paymentDueJson = await paymentDueResponse.json();
          if (paymentDueJson.success) {
            setPaymentDueData(paymentDueJson.data || []);
          }
        }

        // Fetch invoice list data from /accounts/invoice/
        const invoiceResponse = await csrfFetch(`${API_BASE}/accounts/invoice/`, {
          method: "GET",
          credentials: "include",
        });

        let invoiceListData: InvoiceRegistrantData[] = [];
        if (invoiceResponse.ok) {
          const invoiceJson = await invoiceResponse.json();
          if (invoiceJson.success) {
            invoiceListData = invoiceJson.data || [];
            setInvoiceData(invoiceListData);
          }
        }

        // Fetch purchased courses from /accounts/mycourses/
        const mycoursesResponse = await csrfFetch(`${API_BASE}/accounts/mycourses/`, {
          method: "GET",
          credentials: "include",
        });

        let mycoursesJson: any = null;
        if (mycoursesResponse.ok) {
          mycoursesJson = await mycoursesResponse.json();
          console.log('Mycourses API Response:', mycoursesJson);

          if (mycoursesJson.success) {
            const coursesList = mycoursesJson.courses?.courses_list || [];
            console.log('Courses list:', coursesList);
            console.log('Payment due data:', paymentDueJson?.data);

            // Transform courses data with dates from invoice data
            const transformedCourses = coursesList.map((course: any) => {
              // Find corresponding invoice/enrollment data for this course
              const enrollmentData = invoiceListData.find((inv: InvoiceRegistrantData) => {
                // Match by course ID if available in invoice data
                return inv.course_id === course.id ||
                  (inv.course && course.title &&
                    (inv.course.toLowerCase().includes(course.title.toLowerCase().split(' ')[0]) ||
                      course.title.toLowerCase().includes(inv.course.toLowerCase().split(' ')[0])));
              });

              // Find corresponding payment due data to get the course fee and currency
              const paymentDueInfo = paymentDueJson?.data?.find((pdue: PaymentDueData) => pdue.course_id === course.id);

              // Calculate total course fee: per_installment * no_of_installments
              let coursePrice = 0;
              let courseCurrency = '$'; // Default to USD
              if (paymentDueInfo) {
                coursePrice = (paymentDueInfo.per_installment || 0) * (paymentDueInfo.no_of_installments || 1);
                courseCurrency = paymentDueInfo.currency || '$';
              } else {
                coursePrice = enrollmentData?.amount || 0;
              }

              console.log(`Matched course ${course.id}:`, enrollmentData, 'Payment due:', paymentDueInfo, 'Calculated price:', coursePrice, 'Currency:', courseCurrency);

              return {
                id: course.id,
                title: course.title,
                category: course.category || 'Course',
                url_link_name: course.url_link_name,
                purchaseDate: enrollmentData?.created_at || new Date().toISOString(),
                accessTill: enrollmentData?.end_at || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // Default 6 months
                price: coursePrice,
                currency: courseCurrency
              };
            });

            console.log('Transformed courses:', transformedCourses);
            setPurchasedCourses(transformedCourses);

            // Mark that we've successfully set courses to prevent fallback logic
            if (transformedCourses.length > 0) {
              return; // Exit early - don't run fallback logic
            }
          }
        } else {
          console.log('Mycourses API failed:', mycoursesResponse.status);
        }

        // If no courses were set from the successful response, try to set them anyway
        if (mycoursesJson?.courses?.courses_list?.length > 0) {
          const coursesList = mycoursesJson.courses.courses_list;
          const transformedCourses = coursesList.map((course: any) => {
            const paymentDueInfo = paymentDueJson?.data?.find((pdue: PaymentDueData) => pdue.course_id === course.id);
            let coursePrice = 0;
            let courseCurrency = '$'; // Default to USD
            if (paymentDueInfo) {
              coursePrice = (paymentDueInfo.per_installment || 0) * (paymentDueInfo.no_of_installments || 1);
              courseCurrency = paymentDueInfo.currency || '$';
            }
            return {
              id: course.id,
              title: course.title,
              category: course.category || 'Course',
              url_link_name: course.url_link_name,
              purchaseDate: new Date().toISOString(),
              accessTill: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
              price: coursePrice,
              currency: courseCurrency
            };
          });
          console.log('Setting courses from fallback:', transformedCourses);
          setPurchasedCourses(transformedCourses);
          return; // Exit early
        }

        // Final fallback: use invoice data to extract course info if still no courses
        // IMPORTANT: Deduplicate by course_id to avoid showing same course multiple times (from installments)



        if (purchasedCourses.length === 0 && invoiceListData.length > 0) {
          console.log('Using invoice data as fallback for courses');

          // Deduplicate by course_id or course name
          const seenCourseIds = new Set();
          const uniqueInvoiceData: InvoiceRegistrantData[] = [];

          invoiceListData.forEach((inv: InvoiceRegistrantData) => {
            const key = inv.course_id || inv.course;
            if (key && !seenCourseIds.has(key)) {
              seenCourseIds.add(key);
              uniqueInvoiceData.push(inv);
            }
          });

          const coursesFromInvoices = uniqueInvoiceData.map((inv: InvoiceRegistrantData, index: number) => {
            const paymentDueInfo = paymentDueJson?.data?.find((pdue: PaymentDueData) => pdue.course_id === inv.course_id);
            let coursePrice = 0;
            let courseCurrency = '$'; // Default to USD
            if (paymentDueInfo) {
              coursePrice = (paymentDueInfo.per_installment || 0) * (paymentDueInfo.no_of_installments || 1);
              courseCurrency = paymentDueInfo.currency || '$';
            } else {
              coursePrice = inv.amount || 0;
            }
            return {
              id: inv.course_id || index + 100,
              title: inv.course || `Course ${index + 1}`,
              category: 'Course',
              url_link_name: '',
              purchaseDate: inv.created_at || new Date().toISOString(),
              accessTill: inv.end_at || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
              price: coursePrice,
              currency: courseCurrency
            };
          });
          console.log('Courses from invoices (deduplicated):', coursesFromInvoices);
          setPurchasedCourses(coursesFromInvoices);
        }


      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
        setLoadingCourses(false);
      }
    };

    fetchData();
  }, []);

  // Fetch payment history when modal opens with a selected course
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!selectedCourseId || !purchasedModal) {
        return;
      }

      setPaymentHistoryLoading(true);
      try {
        const response = await csrfFetch(`${API_BASE}/accounts/payment_history/${selectedCourseId}/`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const json = await response.json();
          if (json.success) {
            setPaymentHistory(json.data);
          }
        }
      } catch (err) {
        console.error('Error fetching payment history:', err);
        setPaymentHistory(null);
      } finally {
        setPaymentHistoryLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [selectedCourseId, purchasedModal]);

  // Generate payment reminders from API data
  // const getRemindersFromApi = () => {
  //   const reminders: Array<{
  //     title: string;
  //     course: string;
  //     due: string;
  //     amount: string;
  //   }> = [];

  //   paymentDueData.forEach((item) => {
  //     // Check for unpaid second installment
  //     if (item.no_of_installments >= 2 && item.second_installment_paid === 0) {
  //       reminders.push({
  //         title: "Payment reminder",
  //         course: item.course_title,
  //         due: formatDate(new Date().toISOString()),
  //         // amount: formatCurrency(item.second_installment_paid || 0),

  //         amount: formatCurrency( (item.total_second_installment || 0) - (item.second_installment_paid || 0)),

  //       });
  //     }

  //     // Check for unpaid third installment
  //     if (item.no_of_installments === 3 && item.third_installment_paid === 0) {
  //       reminders.push({
  //         title: "Payment reminder",
  //         course: item.course_title,
  //         due: formatDate(new Date().toISOString()),
  //         // amount: formatCurrency(item.third_installment_paid || 0),
  //         amount: formatCurrency( (item.total_third_installment || 0) - (item.third_installment_paid || 0)),
  //       });
  //     }
  //   });

  //   return reminders;
  // };
  const getRemindersFromApi = () => {
    const reminders: Array<{
      title: string;
      course: string;
      due: string;
      amount: string;
      course_id: number;
      currency: string;
      installment_number: number;
      payment_amount: number;
    }> = [];

    paymentDueData.forEach((item) => {

      // Second installment reminder
      if (item.no_of_installments >= 2 && item.second_installment_due > 0) {
        reminders.push({
          title: "Payment reminder",
          course: item.course_title,
          due: item.second_installment_due_date ? formatDate(item.second_installment_due_date) : formatDate(new Date().toISOString()),
          amount: formatCurrency(item.second_installment_due, item.currency),
          course_id: item.course_id,
          currency: item.currency,
          installment_number: 2,
          payment_amount: item.second_installment_due,
        });
      }

      // Third installment reminder
      if (item.no_of_installments === 3 && item.third_installment_due > 0) {
        reminders.push({
          title: "Payment reminder",
          course: item.course_title,
          due: item.third_installment_due_date ? formatDate(item.third_installment_due_date) : formatDate(new Date().toISOString()),
          amount: formatCurrency(item.third_installment_due, item.currency),
          course_id: item.course_id,
          currency: item.currency,
          installment_number: 3,
          payment_amount: item.third_installment_due,
        });
      }

    });

    return reminders;
  };

  // Payment reminders from backend data
  const remindersFromApi = getRemindersFromApi();

  // Fallback to mock data if no API data
  const displayReminders = remindersFromApi.length > 0 ? remindersFromApi : [
    {
      title: "Payment reminder",
      course: "AH-02: Introduction to Fundamentals of Machine Learning",
      due: "November 02, 2025",
      amount: "$12",
    },
    {
      title: "Payment reminder",
      course: "ML-201: Deep Learning Advanced",
      due: "November 15, 2025",
      amount: "$50",
    },
  ];

  // Convert API invoice data to component format
  const getInvoiceItems = (): Invoice[] => {
    if (invoiceData.length > 0) {
      return invoiceData.map((inv, index) => ({
        id: String(inv.invoice_id || index + 1),
        date: inv.created_at || new Date().toISOString(),
        amount: inv.amount_paid
          ? `${inv.currency || '$'}${Number(inv.amount_paid).toFixed(2)}`
          : "$0.00",
        status: (inv.status || 'pending') as 'paid' | 'pending' | 'failed',
        downloadUrl: inv.download_url || `${API_BASE}/accounts/invoice/${inv.order_id}/${inv.invoice_id}/None`,
        // New Phase 2 fields
        currency: inv.currency || '$',
        currency_code: inv.currency_code || 'USD',
        payment_method: inv.payment_method,
        installment_number: inv.installment_number,
        no_of_installments: inv.no_of_installments,
        course: inv.course,
        course_amount: inv.course_amount,
        amount_paid: inv.amount_paid,
        total_amount: inv.total_amount,
      }));
    }
    return data.invoices;
  };

  const invoices = getInvoiceItems();

  // Generate payment history from API data
  const getBasicInstallments = () => {
    if (paymentDueData.length > 0) {
      const installments: Array<{
        id: number;
        paid: string;
        status: "Paid" | "Pending" | "Due";
      }> = [];

      paymentDueData.forEach((item, index) => {
        installments.push({
          id: index + 1,
          paid: formatCurrency(item.second_installment_paid || 0),
          status: item.second_installment_paid > 0 ? "Paid" : "Due"
        });
      });

      return installments;
    }

    // Default mock data
    return data.invoices.slice(0, 6).map((invoice, index) => ({
      id: index + 1,
      paid: invoice.amount,
      status: invoice.status === 'paid' ? 'Paid' as const : 'Pending' as const
    }));
  };

  const basicInstallments = getBasicInstallments();

  const customInstallments = [
    { id: 1, paid: "$25", status: "Paid" as const },
    { id: 2, paid: "$25", status: "Paid" as const },
    { id: 3, paid: "$25", status: "Due" as const },
    { id: 4, paid: "$25", status: "Due" as const },
    { id: 5, paid: "$25", status: "Due" as const },
    { id: 6, paid: "$25", status: "Due" as const },
  ];

  // Generate purchased payments from API invoice data
  const getPurchasedPayments = () => {
    // if (invoiceData.length > 0) {
    //   return invoiceData.slice(0, 3).map((inv, index) => ({
    //     id: index + 1,
    //     date: formatDate(inv.created_at || new Date().toISOString()),
    //     amount: "$29.99",
    //     status: "Paid" as const
    //   }));
    // }
    if (invoiceData.length > 0) {
      return invoiceData.map((inv) => ({
        id: inv.installment_number,
        date: formatDate(inv.created_at || new Date().toISOString()),
        amount: `${inv.currency}${Number(inv.amount_paid).toFixed(2)}`,
        status: "Paid" as const,
        installmentLabel: `${inv.installment_number}/${inv.no_of_installments}`
      }));
    }

    return data.invoices.slice(0, 3).map((invoice, index) => ({
      id: index + 1,
      date: formatDate(invoice.date),
      amount: invoice.amount,
      status: invoice.status === 'paid' ? 'Paid' as const : 'Pending' as const
    }));
  };

  const purchasedPayments = getPurchasedPayments();

  // Get plan details based on current plan
  const getPlanDetails = () => {
    if (data.currentPlan.includes("Basic")) {
      return {
        name: "Basic Plan",
        price: "$15/Month",
        expires: "21 July 2026",
        description: "Basic Plan"
      };
    } else if (data.currentPlan.includes("Pro")) {
      return {
        name: "Pro Monthly",
        price: "$29/Month",
        expires: formatDate(data.nextBillingDate),
        description: data.currentPlan
      };
    } else {
      return {
        name: data.currentPlan,
        price: "$25/Month",
        expires: formatDate(data.nextBillingDate),
        description: data.currentPlan
      };
    }
  };

  const planDetails = getPlanDetails();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (basicModal || customModal || purchasedModal || cancelModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [basicModal, customModal, purchasedModal, cancelModal]);

  // Handle download invoice
  const handleDownloadInvoice = async (invoice: Invoice) => {
    console.log("Invoice object:", invoice);
    console.log("Download URL:", invoice.downloadUrl);

    try {
      // If we have an order_id, check if invoice is ready before downloading
      const matchedInvoice = invoiceData.find(inv => inv.invoice_id === parseInt(invoice.id));
      if (matchedInvoice?.order_id) {
        setInvoiceCheckLoading(matchedInvoice.order_id);
        //  console.log("Invoice object:", invoice);
        //  console.log("Download URL:", invoice.downloadUrl);

        // Check invoice status using new endpoint
        const statusResponse = await csrfFetch(
          `${API_BASE}/accounts/invoice/status/${matchedInvoice.order_id}/`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const statusData = await statusResponse.json();
        setInvoiceCheckLoading(null);

        if (!statusData.success) {
          alert(`${statusData.message}`);
          return;
        }

        if (!statusData.can_download) {
          const reasons = {
            'pending_payment': '⏳ Payment is still pending. Please complete the payment first.',
            'order_incomplete': '⏳ Order is not yet complete. Please try again later.',
          };
          alert(`Cannot download invoice: ${reasons[statusData.invoice_status as keyof typeof reasons] || 'Unknown reason'}`);
          return;
        }
      }

      const fullUrl = invoice.downloadUrl.startsWith('http')
        ? invoice.downloadUrl
        : `${API_BASE}${invoice.downloadUrl}`;

      // Fetch the PDF from backend
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Failed to download invoice: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a temporary download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.id}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Invoice downloaded:', invoice.id);
    } catch (error) {
      console.error(' Download failed:', error);
      alert(`Failed to download invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle payment for installment
  const handlePaymentClick = async (reminder: any) => {
    setPaymentLoading(true);
    try {
      const response = await csrfFetch(`${API_BASE}/courses/payment/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: reminder.course_id,
          installment_number: reminder.installment_number,
          amount: reminder.payment_amount,
          currency: reminder.currency,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If we have Razorpay order details, open payment gateway
        if (data.data?.razorpay_order_id) {
          // Launch Razorpay payment window
          const options = {
            key: data.data.razorpay_key,
            amount: data.data.amount,
            currency: data.data.currency,
            name: 'DeepEigen Courses',
            description: `Installment ${reminder.installment_number} - ${reminder.course}`,
            order_id: data.data.razorpay_order_id,
            prefill: {
              name: data.data.customer_name,
              email: data.data.customer_email,
            },
            handler: async function (response: any) {
              // Payment successful - now verify with backend
              try {
                // ✅ Using csrfFetch wrapper for POST
                const verifyResponse = await csrfFetch(`${API_BASE}/courses/payment_verify/`, {
                  method: 'POST',
                  body: JSON.stringify({
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                    course_id: data.data.course_id,
                    installment_number: data.data.installment_number,
                    amount: data.data.amount / 100, // Convert back from paise/cents
                  }),
                });

                const verifyData = await verifyResponse.json();

                if (verifyResponse.ok && verifyData.success) {
                  alert(`✅ Payment verified! Installment ${data.data.installment_number} marked as paid.`);
                  // Refresh payment due data
                  window.location.reload();
                } else {
                  alert(`⚠️ Payment received but verification failed: ${verifyData.message}`);
                }
              } catch (err) {
                console.error('Verification error:', err);
                alert(`⚠️ Payment completed but verification failed. Please contact support.`);
              }
            },
            modal: {
              ondismiss: function () {
                alert('Payment cancelled by user');
              }
            }
          };

          // Create Razorpay instance and open
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          alert(`✅ Payment processed for ${reminder.amount}`);
          window.location.reload();
        }
      } else {
        alert(`❌ Payment failed: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(`❌ Error processing payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4  max-w-[90vw] sm:gap-6 lg:gap-8 px-2 sm:px-4 lg:px-4 py-8 sm:py-10 lg:py-12 flex-1 overflow-x-hidden">


      {/* Swiper Section */}
      <div className="w-full max-w-[90vw] mt-[-8vw] sm:mt-[-2vw] lg:max-w-[70vw]">
        <div className="w-full">
          <Swiper
            modules={[Pagination, Autoplay]}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            spaceBetween={12}
            slidesPerView={1}
            className="w-full mx-auto"
          >
            {displayReminders.map((item, i) => (
              <SwiperSlide key={i}>
                <div className="flex  justify-center  px-2 sm:px-2">
                  <div className="bg-[#ffd06c] p-4 sm:p-5 md:p-6 rounded-xl w-full ">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 lg:gap-6">
                      {/* Left Section */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[#1a212f] font-bricolage text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">
                          {item.title}
                        </h2>
                        <div className="pb-2 sm:pb-3">
                          <p className="text-[rgba(26,33,47,0.7)] text-xs sm:text-sm md:text-base leading-relaxed">
                            Your course: <span className="font-semibold">{item.course}</span> payment is due. Please complete the payment to continue uninterrupted access to courses and learning tools.
                          </p>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-start lg:items-end gap-3 sm:gap-3 w-full lg:w-auto">
                        <button
                          onClick={() => handlePaymentClick(item)}
                          disabled={paymentLoading}
                          className="bg-[#174cd2] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base w-full lg:w-auto hover:bg-[#1546c0] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {paymentLoading ? 'Processing...' : `Pay ${item.amount}`}
                        </button>
                        <p className="text-[rgba(26,33,47,0.7)] text-xs sm:text-sm lg:text-sm whitespace-nowrap">
                          Due on {item.due}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Swiper Pagination Styles */}
          <style>{`
            .swiper-pagination {
              position: relative !important;
              margin-top: 12px !important;
              bottom: 0 !important;
            }
            .swiper-pagination-bullet {
              width: 8px !important;
              height: 8px !important;
              margin: 0 4px !important;
              background-color: #D1D5DB !important;
              opacity: 1 !important;
            }
            .swiper-pagination-bullet-active {
              width: 24px !important;
              border-radius: 4px !important;
              background-color: #174cd2 !important;
            }
            @media (min-width: 640px) {
              .swiper-pagination-bullet {
                width: 10px !important;
                height: 10px !important;
              }
              .swiper-pagination-bullet-active {
                width: 32px !important;
              }
            }
          `}</style>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center  items-start gap-4 sm:gap-5 lg:gap-6 self-stretch max-w-[90vw] lg:max-w-[70vw]  w-full">
        {/* Subscription Plan */}
        {/* <div className="flex flex-col items-start gap-2 sm:gap-3 self-stretch w-full">
          <h3 className="text-[rgba(26,33,47,0.7)] font-bricolage text-sm sm:text-base lg:text-base font-semibold tracking-[-0.14px] sm:tracking-[-0.16px] lg:tracking-[-0.16px]">
            Subscription plan
          </h3>
          <div className="flex flex-col justify-center items-start gap-3 sm:gap-4 self-stretch rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-[#E5F4FF] to-[#F8FBFF] w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center self-stretch gap-3 sm:gap-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 flex-1">
                <span className="text-[#1A212F] font-bricolage text-base sm:text-lg lg:text-lg font-normal">
                  {planDetails.name}
                </span>
                <span className="text-[#174CD2] font-bricolage text-sm sm:text-base lg:text-base font-semibold tracking-[-0.14px] sm:tracking-[-0.16px] lg:tracking-[-0.16px]">
                  {planDetails.price}
                </span>
              </div>


              <Link to="/payment" className="flex px-3 sm:px-4 py-2 cursor-pointer justify-center items-center gap-2 rounded-[90px] border border-[#174CD2] text-[#174CD2] font-bricolage text-xs sm:text-sm lg:text-sm font-semibold leading-[93%] w-full sm:w-auto hover:bg-blue-50 transition-colors whitespace-nowrap">
                {data.status === 'active' ? 'Upgrade' : 'Subscribe'}
              </Link>

            </div>
            <div className="h-px self-stretch bg-[rgba(0,0,0,0.08)] w-full" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center self-stretch gap-2 sm:gap-0 w-full">
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.0026 1.83325C6.3671 1.83325 4.79859 2.48295 3.64211 3.63943C2.48564 4.7959 1.83594 6.36442 1.83594 7.99992C1.83594 9.63542 2.48564 11.2039 3.64211 12.3604C4.79859 13.5169 6.3671 14.1666 8.0026 14.1666C9.63811 14.1666 11.2066 13.5169 12.3631 12.3604C13.5196 11.2039 14.1693 9.63542 14.1693 7.99992C14.1693 6.36442 13.5196 4.7959 12.3631 3.63943C11.2066 2.48295 9.63811 1.83325 8.0026 1.83325ZM0.835938 7.99992C0.835938 4.04192 4.0446 0.833252 8.0026 0.833252C11.9606 0.833252 15.1693 4.04192 15.1693 7.99992C15.1693 11.9579 11.9606 15.1666 8.0026 15.1666C4.0446 15.1666 0.835938 11.9579 0.835938 7.99992ZM8.0026 4.83325C8.13521 4.83325 8.26239 4.88593 8.35616 4.9797C8.44993 5.07347 8.5026 5.20064 8.5026 5.33325V7.79325L10.0226 9.31325C10.0717 9.35903 10.1111 9.41423 10.1385 9.47556C10.1658 9.53689 10.1805 9.6031 10.1817 9.67024C10.1828 9.73737 10.1705 9.80406 10.1454 9.86632C10.1202 9.92858 10.0828 9.98513 10.0353 10.0326C9.98782 10.0801 9.93126 10.1175 9.869 10.1427C9.80674 10.1678 9.74006 10.1802 9.67292 10.179C9.60579 10.1778 9.53958 10.1631 9.47825 10.1084C9.41691 10.1084 9.36171 10.069 9.31594 10.0199L7.64927 8.35325C7.55548 8.25957 7.50272 8.13248 7.5026 7.99992V5.33325C7.5026 5.20064 7.55528 5.07347 7.64905 4.9797C7.74282 4.88593 7.87 4.83325 8.0026 4.83325Z" fill="#1A212F" fillOpacity="0.7" />
                </svg>
                <span className="text-[rgba(26,33,47,0.7)] font-bricolage text-xs lg:text-sm font-light leading-[150%] truncate">
                  Expires on {planDetails.expires}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 lg:gap-4 flex-wrap mt-2 sm:mt-0">
                <button
                  onClick={() => setBasicModal(true)}
                  className="text-[rgba(26,33,47,0.7)] cursor-pointer font-bricolage text-xs lg:text-sm font-semibold tracking-[-0.12px] sm:tracking-[-0.14px] lg:tracking-[-0.14px] underline text-left hover:text-[#1A212F] whitespace-nowrap"
                >
                  View Payment History
                </button>
                <Link to="/courses" className="text-[rgba(26,33,47,0.7)] cursor-pointer font-bricolage text-xs lg:text-sm font-semibold tracking-[-0.12px] sm:tracking-[-0.14px] lg:tracking-[-0.14px] underline text-left hover:text-[#1A212F] whitespace-nowrap">
                  View Courses
                </Link>


                <button
                  onClick={() => setCancelModal(true)}
                  className="text-[#CE2823] cursor-pointer font-bricolage text-xs lg:text-sm font-semibold tracking-[-0.12px] sm:tracking-[-0.14px] lg:tracking-[-0.14px] text-left hover:text-red-700 whitespace-nowrap"
                >
                  {data.status === 'active' ? 'Cancel Subscription' : 'Reactivate'}
                </button>


              </div>
            </div>
          </div>
        </div> */}



        {/* Purchased Courses */}
        <div className="flex flex-col items-start gap-2 sm:gap-3 self-stretch w-full">
          <h3 className="text-[rgba(26,33,47,0.7)] font-bricolage text-sm sm:text-base lg:text-base font-semibold tracking-[-0.14px] sm:tracking-[-0.16px] lg:tracking-[-0.16px]">
            Purchased courses
          </h3>
          <div className="flex flex-col justify-center items-start gap-3 sm:gap-4 self-stretch rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-[#E5F4FF] to-[#F8FBFF] w-full">
            {loadingCourses ? (
              <div className="w-full flex justify-center items-center py-8">
                <span className="text-[rgba(26,33,47,0.7)] font-bricolage text-sm">Loading courses...</span>
              </div>
            ) : purchasedCourses.length > 0 ? (
              purchasedCourses.map((course, index) => (
                <div key={course.id} className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 self-stretch w-full">
                    <div className="flex px-3 sm:px-4 lg:px-5 py-3 sm:py-4 lg:py-4 justify-center items-center rounded-md bg-gradient-to-b from-[#000155] to-[#153F9A] w-14 sm:w-16 lg:w-20 h-12 sm:h-14 lg:h-16 flex-shrink-0">
                      <span className="text-white font-bricolage text-xs sm:text-xs lg:text-sm font-bold leading-normal text-center">
                        {course.category.split(' ')[0] || 'Course'}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center items-start gap-1.5 sm:gap-2 flex-1 py-0 min-w-0">
                      <h4 className="self-stretch text-[#1A212F] font-bricolage text-sm sm:text-base lg:text-base font-semibold line-clamp-2 sm:line-clamp-2">
                        {course.title}
                      </h4>
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 lg:gap-2 flex-wrap">
                        <span className="text-[rgba(26,33,47,0.7)] font-bricolage text-xs lg:text-xs font-light leading-[150%] whitespace-nowrap">
                          Purchased on {formatDate(course.purchaseDate)}
                        </span>
                        <div className="hidden xs:block w-px h-3 sm:h-4 lg:h-4 bg-[rgba(26,33,47,0.24)]" />
                        <span className="text-[rgba(26,33,47,0.7)] font-bricolage text-xs lg:text-xs font-light leading-[150%] whitespace-nowrap">
                          Access till {formatDate(course.accessTill)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                      <span className="text-[#1A212F] font-bricolage text-base sm:text-lg lg:text-lg font-bold whitespace-nowrap">
                        {course.price ? `${course.currency || '$'}${course.price.toFixed(2)}` : `${course.currency || '$'}0`}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setPurchasedModal(true);
                        }}
                        className="text-[rgba(26,33,47,0.7)] font-bricolage cursor-pointer text-xs lg:text-xs font-semibold tracking-[-0.12px] sm:tracking-[-0.14px] lg:tracking-[-0.14px] underline text-left sm:text-right hover:text-[#1A212F] whitespace-nowrap"
                      >
                        View Payment History
                      </button>
                    </div>
                  </div>
                  {index < purchasedCourses.length - 1 && (
                    <div className="h-px self-stretch bg-[rgba(0,0,0,0.08)] my-3 sm:my-3 lg:my-3" />
                  )}
                </div>
              ))
            ) : (
              <div className="w-full flex justify-center items-center py-8">
                <span className="text-[rgba(26,33,47,0.7)] font-bricolage text-sm">No purchased courses found</span>
              </div>
            )}
          </div>
        </div>





        {/* Invoices */}
        <div className="flex flex-col gap-2 sm:gap-3 w-full">
          <h3 className="text-[rgba(26,33,47,0.7)] font-bricolage text-sm sm:text-base font-semibold">
            Invoices
          </h3>

          {/* Desktop */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <div className="min-w-[900px]">

              {/* Header */}
              <div className="grid grid-cols-[2fr_100px_100px_120px_80px_80px] px-4 py-3 border-b border-[rgba(26,33,47,0.24)]">
                <span className="text-sm font-light text-[#1A212F]">Course / Invoice</span>
                <span className="text-sm font-light text-[#1A212F]">Amount</span>
                <span className="text-sm font-light text-[#1A212F]">Status</span>
                <span className="text-sm font-light text-[#1A212F]">Date</span>
                <span className="text-sm font-light text-[#1A212F]">Installment</span>
                <span className="text-sm font-light text-[#1A212F]">Action</span>
              </div>

              {/* Rows */}
              {invoices.map((invoice) => {
                const statusBadge = getStatusBadge(invoice.status);
                const isLoading = invoiceCheckLoading === parseInt(invoice.id);
                return (
                  <div
                    key={invoice.id}
                    className="grid grid-cols-[2fr_100px_100px_120px_80px_80px] px-4 py-3 border-b border-[rgba(26,33,47,0.24)] items-center hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-normal text-[#1A212F] line-clamp-1">
                        Invoice #{invoice.id}
                      </span>
                      {invoice.course && (
                        <span className="text-xs text-[rgba(26,33,47,0.6)]">
                          {invoice.course}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-normal text-[#1A212F]">
                      {invoice.amount}
                    </span>

                    <span className={`text-xs font-semibold px-2 py-1 w-14 rounded inline-block ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>

                    <span className="text-sm font-normal text-[#1A212F]">
                      {formatDate(invoice.date)}
                    </span>

                    <span className="text-sm font-normal text-[#1A212F]">
                      {invoice.installment_number ? `${invoice.installment_number}/${invoice.no_of_installments || 1}` : '-'}
                    </span>

                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      disabled={isLoading}
                      className="p-1 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isLoading ? 'Checking invoice status...' : 'Download invoice'}
                    >
                      {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#174CD2" strokeWidth="2" strokeOpacity="0.25"></circle>
                          <path d="M12 2a10 10 0 0 1 0 20" stroke="#174CD2" strokeWidth="2" strokeLinecap="round"></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 2v11m0 0l3.5-4m-3.5 4L8.5 9M4 14v3a3 3 0 003 3h10a3 3 0 003-3v-3"
                            stroke="#174CD2"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile / Tablet */}
          <div className="lg:hidden flex flex-col divide-y divide-[rgba(26,33,47,0.15)]">
            {invoices.map((invoice) => {
              const statusBadge = getStatusBadge(invoice.status);
              const isLoading = invoiceCheckLoading === parseInt(invoice.id);
              return (
                <div key={invoice.id} className="py-4 flex flex-col gap-2 hover:bg-gray-50">

                  {/* Title + Download */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-sm font-medium text-[#1A212F] leading-snug line-clamp-2">
                        Invoice #{invoice.id}
                      </p>
                      {invoice.course && (
                        <p className="text-xs text-[rgba(26,33,47,0.6)] line-clamp-1">
                          {invoice.course}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      disabled={isLoading}
                      className="p-1 shrink-0 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="#174CD2" strokeWidth="2" strokeOpacity="0.25"></circle>
                          <path d="M12 2a10 10 0 0 1 0 20" stroke="#174CD2" strokeWidth="2" strokeLinecap="round"></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2v11m0 0l3.5-4m-3.5 4L8.5 9M4 14v3a3 3 0 003 3h10a3 3 0 003-3v-3"
                            stroke="#174CD2"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-xs font-semibold px-2 py-1 rounded inline-block w-fit ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>

                  {/* Date + Amount + Installment */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-[rgba(26,33,47,0.7)]">
                    <span>{formatDate(invoice.date)}</span>
                    <span className="hidden sm:block w-[1px] h-3 bg-[rgba(26,33,47,0.3)]" />
                    <span className="font-semibold">{invoice.amount}</span>
                    <span className="hidden sm:block w-[1px] h-3 bg-[rgba(26,33,47,0.3)]" />
                    {invoice.installment_number && (
                      <span>Installment {invoice.installment_number}/{invoice.no_of_installments || 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals (unchanged from your code) */}
      {/* Modal Overlay */}
      {(basicModal || customModal || purchasedModal || cancelModal) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          onClick={() => {
            setBasicModal(false);
            setCustomModal(false);
            setPurchasedModal(false);
            setCancelModal(false);
          }}
        />
      )}

      {/* Basic Plan Modal */}
      {basicModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] px-2 sm:px-4 overflow-y-auto py-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl relative 
                        w-full max-w-[95%] xs:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl
                        max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 my-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setBasicModal(false)}
              className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl md:text-3xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              &times;
            </button>

            <h2 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4 sm:mt-5 font-semibold text-gray-900">
              {planDetails.name}
            </h2>

            <p className="text-center text-gray-500 mt-1 sm:mt-2 mb-4 sm:mb-5 text-sm sm:text-base md:text-lg lg:text-xl">
              Monthly Subscription
            </p>

            <div className="overflow-x-auto -mx-1 sm:-mx-0">
              <table className="w-full text-xs sm:text-sm md:text-base text-left text-gray-700 min-w-[280px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Month</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Amount</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {basicInstallments.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Month {item.id}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{item.paid}</td>
                      <td
                        className={`py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap ${item.status === "Paid" ? "text-green-600" : "text-gray-500"
                          }`}
                      >
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 sm:mt-5 text-center">
              <button
                onClick={() => setBasicModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base md:text-lg w-full sm:w-auto transition-colors whitespace-nowrap"
              >
                Okay, Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Plan Modal */}
      {customModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] px-2 sm:px-4 overflow-y-auto py-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl relative 
                        w-full max-w-[95%] xs:max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl
                        max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 my-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setCustomModal(false)}
              className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl md:text-3xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              &times;
            </button>

            <h2 className="text-center text-lg sm:text-xl md:text-2xl lg:text-3xl mt-4 sm:mt-5 font-semibold text-gray-900">
              Custom plan
            </h2>

            <p className="text-center text-gray-500 mt-1 sm:mt-2 mb-4 sm:mb-5 text-sm sm:text-base md:text-lg lg:text-xl">
              Yearly Subscription
            </p>

            <div className="overflow-x-auto -mx-1 sm:-mx-0">
              <table className="w-full text-xs sm:text-sm md:text-base text-left text-gray-700 min-w-[280px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Installment</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Amount</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customInstallments.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">Installment {item.id}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{item.paid}</td>
                      <td
                        className={`py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap ${item.status === "Paid" ? "text-green-600" : "text-gray-500"
                          }`}
                      >
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 sm:mt-5 text-center">
              <button
                onClick={() => setCustomModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base md:text-lg w-full sm:w-auto transition-colors whitespace-nowrap"
              >
                Okay, Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchased Course Modal */}
      {purchasedModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] px-2 sm:px-4 overflow-y-auto py-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl relative 
                        w-full max-w-[95%] xs:max-w-xs sm:max-w-md md:max-w-lg
                        max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setPurchasedModal(false)}
              className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              &times;
            </button>

            {paymentHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="text-gray-500 text-sm">Loading payment history...</span>
              </div>
            ) : paymentHistory ? (
              <>
                <h2 className="text-center text-lg sm:text-xl md:text-2xl mt-3 sm:mt-4 font-semibold text-gray-900">
                  Payment History
                </h2>

                <p className="text-center text-gray-500 mt-1 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg px-2">
                  {paymentHistory.course_name}
                </p>

                <div className="bg-gradient-to-r from-[#E5F4FF] to-[#F8FBFF] rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Course Fee:</span>
                      <span className="text-xs sm:text-sm font-semibold">{paymentHistory.currency}{paymentHistory.total_fee?.toFixed(2)}</span>
                    </div>
                    <div className="hidden xs:block w-px h-3 sm:h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Installments:</span>
                      <span className="text-xs sm:text-sm">{paymentHistory.no_of_installments}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-1 sm:-mx-0">
                  <table className="w-full text-xs sm:text-sm md:text-base text-left text-gray-700 min-w-[280px]">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500">
                        <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Installment</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Amount</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Paid Date</th>
                        <th className="py-2 sm:py-3 px-2 sm:px-3 font-medium whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.payments.map((payment: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">#{payment.installment_number}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">{paymentHistory.currency}{payment.amount?.toFixed(2)}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                            {payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-green-600 whitespace-nowrap">
                            {payment.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 mt-3 sm:mt-4 md:mt-5 pt-2 sm:pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">Total Paid:</span>
                    <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                      {paymentHistory.currency}{paymentHistory.total_paid?.toFixed(2)}
                    </span>
                  </div>
                  {paymentHistory.remaining_due > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">Remaining Due:</span>
                      <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600">
                        {paymentHistory.currency}{paymentHistory.remaining_due?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 md:mt-5 text-center">
                  <button
                    onClick={() => setPurchasedModal(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base w-full sm:w-auto transition-colors whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-center text-lg sm:text-xl md:text-2xl mt-3 sm:mt-4 font-semibold text-gray-900">
                  Payment History
                </h2>
                <p className="text-center text-gray-500 mt-4 mb-4">No payment history found</p>
                <div className="mt-3 sm:mt-4 md:mt-5 text-center">
                  <button
                    onClick={() => setPurchasedModal(false)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base w-full sm:w-auto transition-colors whitespace-nowrap"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[101] px-3 sm:px-4 overflow-y-auto py-4">
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-[95%] xs:max-w-xs sm:max-w-md p-3 sm:p-4 md:p-6 relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setCancelModal(false)}
              className="absolute top-2 right-3 sm:top-3 sm:right-4 text-lg sm:text-xl text-gray-500 hover:text-gray-700 cursor-pointer z-10"
            >
              ✕
            </button>

            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-[#FFF4E5] p-2 sm:p-3 rounded-full">
                <span className="text-2xl sm:text-3xl">⚠️</span>
              </div>
            </div>

            <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 px-2">
              {data.status === 'active' ? 'Cancel Subscription?' : 'Reactivate Subscription?'}
            </h2>

            <p className="text-center text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base px-2">
              <span className="font-medium">{planDetails.name}</span>{" "}
              <span className="text-indigo-600 font-semibold">{planDetails.price}</span>
            </p>

            <p className="text-center text-gray-500 mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm leading-relaxed px-1 sm:px-2">
              {data.status === 'active'
                ? 'Are you sure you want to cancel this subscription? You will lose access to all courses and resources provided in this plan.'
                : 'Do you want to reactivate your subscription? You will regain access to all courses and resources in this plan.'}
            </p>

            <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-5 md:mt-6 gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => setCancelModal(false)}
                className="px-3 sm:px-4 md:px-5 py-2 cursor-pointer rounded-md font-medium border border-purple-600 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base"
              >
                <span>←</span> Go Back
              </button>

              <button className="px-3 sm:px-4 md:px-5 py-2 cursor-pointer rounded-md font-medium border border-red-500 text-red-600 hover:bg-red-50 transition-colors text-sm sm:text-base">
                {data.status === 'active' ? 'Cancel Subscription' : 'Reactivate'}
              </button>
            </div>

            <p className="text-center text-gray-500 text-xs mt-3 sm:mt-4 md:mt-5 px-1">
              To check the eligibility of refund, please refer our{" "}
              <a href="#" className="text-blue-600 underline hover:text-blue-800">
                Refund Policy
              </a>
            </p>
          </div>
          ``       </div>
      )}
    </div>
  );
}