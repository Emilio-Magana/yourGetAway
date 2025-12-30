import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { subDays } from "date-fns";

import { deleteBooking as deleteBookingApi } from "../../services/apiBookings";
import { getBookingsAfterDate } from "../../services/apiBookings";
import { getStaysAfterDate } from "../../services/apiBookings";
import { getBookings } from "../../services/apiBookings";
import { getBooking } from "../../services/apiBookings";
import { PAGE_SIZE } from "../../utils/constants";

export function useBooking() {
  const { bookingId } = useParams();

  const {
    isLoading,
    data: booking,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId!),
    retry: false,
  });

  return { isLoading, error, booking };
}
export function useBookings() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // FILTER
  const filterValue = searchParams.get("status");
  const filter =
    !filterValue || filterValue === "all"
      ? null
      : { field: "status", value: filterValue };
  // { field: "totalPrice", value: 5000, method: "gte" };

  // SORT
  const sortByRaw = searchParams.get("sortBy") || "startDate-desc";
  const [field, direction] = sortByRaw.split("-");
  const sortBy = { field, direction };

  // PAGINATION
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // QUERY
  const {
    isLoading,
    data: { data: bookings, count } = {},
    error,
  } = useQuery({
    queryKey: ["bookings", filter, sortBy, page],
    queryFn: () => getBookings({ filter, sortBy, page }),
  });

  // PRE-FETCHING
  if (count) {
    const pageCount = Math.ceil(count / PAGE_SIZE);

    if (page < pageCount)
      queryClient.prefetchQuery({
        queryKey: ["bookings", filter, sortBy, page + 1],
        queryFn: () => getBookings({ filter, sortBy, page: page + 1 }),
      });

    if (page > 1)
      queryClient.prefetchQuery({
        queryKey: ["bookings", filter, sortBy, page - 1],
        queryFn: () => getBookings({ filter, sortBy, page: page - 1 }),
      });
  }

  return { isLoading, error, bookings, count };
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  const { isLoading: isDeleting, mutate: deleteBooking } = useMutation({
    mutationFn: deleteBookingApi,
    onSuccess: () => {
      toast.success("Booking successfully deleted");

      queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return { isDeleting, deleteBooking };
}

export function useRecentBookings() {
  const [searchParams] = useSearchParams();

  const numDays = !searchParams.get("last")
    ? 7
    : Number(searchParams.get("last"));
  const queryDate = subDays(new Date(), numDays).toISOString();

  const { isLoading, data: bookings } = useQuery({
    queryFn: () => getBookingsAfterDate(queryDate),
    queryKey: ["bookings", `last-${numDays}`],
  });

  return { isLoading, bookings };
}
export function useRecentStays() {
  const [searchParams] = useSearchParams();

  const numDays = !searchParams.get("last")
    ? 7
    : Number(searchParams.get("last"));
  const queryDate = subDays(new Date(), numDays).toISOString();

  const { isLoading, data: stays } = useQuery({
    queryFn: () => getStaysAfterDate(queryDate),
    queryKey: ["stays", `last-${numDays}`],
  });

  const confirmedStays = stays?.filter(
    (stay) => stay.status === "checked-in" || stay.status === "checked-out"
  );

  return { isLoading, stays, confirmedStays, numDays };
}
