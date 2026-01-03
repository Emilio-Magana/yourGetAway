import { getToday } from "../utils/helpers";
import supabase from "./supabase";
import { PAGE_SIZE } from "../utils/constants";

/**
 * Gets a list of bookings with the given filter, sort order, and pagination.
 *
 * @param {Object} args - The arguments for the query.
 * @param {Object} [args.filter] - The filter to apply to the query.
 * @param {Object} [args.filter.field] - The field to filter on.
 * @param {Object} [args.filter.value] - The value to filter with.
 * @param {Object} [args.filter.method] - The method to use for filtering. Defaults to "eq".
 * @param {Object} [args.sortBy] - The sort order to apply to the query.
 * @param {Object} [args.sortBy.field] - The field to sort on.
 * @param {Object} [args.sortBy.direction] - The direction to sort in. Defaults to "asc".
 * @param {number} [args.page] - The page number to load.
 * @returns {Promise<{data: Array<Object>, count: number}>} - The list of bookings and the total count.
 */
export async function getBookings({
  filter,
  sortBy,
  page,
}: {
  filter?: { field: string; value: string; method?: string };
  sortBy?: { field: string; direction?: string };
  page?: number;
}): Promise<{ data: Array<Object>; count: number }> {
  let query = supabase
    .from("bookings")
    .select(
      "id, created_at, startDate, endDate, numNights, numGuests, status, totalPrice, cabins(name), guests(fullName, email)",
      { count: "exact" }
    );

  // FILTER
  if (filter) {
    const { field, value, method = "eq" } = filter;
    query = query[method || "eq"](field, value);
  }

  // SORT
  if (sortBy) {
    const { field, direction = "asc" } = sortBy;
    query = query.order(field, {
      ascending: direction === "asc",
    });
  }

  if (page) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    throw new Error("Bookings could not be loaded");
  }

  return { data, count };
}

export async function getBooking(id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, cabins(*), guests(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking not found");
  }

  return data;
}

// Returns all BOOKINGS that are were created after the given date. Useful to get bookings created in the last 30 days, for example.
// date: ISOString
export async function getBookingsAfterDate(date: Date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("created_at, totalPrice, extrasPrice")
    .gte("created_at", date)
    .lte("created_at", getToday({ end: true }));

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Returns all STAYS that are were created after the given date
export async function getStaysAfterDate(date: Date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName)")
    .gte("startDate", date)
    .lte("startDate", getToday());

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data;
}

// Activity means that there is a check in or a check out today
export async function getStaysTodayActivity() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, guests(fullName, nationality, countriesFlag)")
    .or(
      `and(status.eq.unconfirmed,startDate.eq.${getToday()}),and(status.eq.checked-in,endDate.eq.${getToday()})`
    )
    .order("created_at");

  // Equivalent to this. But by querying this, we only download the data we actually need, otherwise we would need ALL bookings ever created
  // (stay.status === 'unconfirmed' && isToday(new Date(stay.startDate))) ||
  // (stay.status === 'checked-in' && isToday(new Date(stay.endDate)))

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }
  return data;
}

export async function updateBooking(id, obj) {
  const { data, error } = await supabase
    .from("bookings")
    .update(obj)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  return data;
}

export async function deleteBooking(id) {
  // REMEMBER RLS POLICIES
  const { data, error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }
  return data;
}
