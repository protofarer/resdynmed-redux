// ? what's difference between POST and GET
// ? between searchParams from request.url vs formData from request body
export async function action({ request }: ActionFunctionArgs) {
	// TODO request body should have: the query string
	// TODO sanitize and validate
	// TODO match to geocoords
	// TODO if match, redirect to portal
	// TODO else, back to index with bad `q` searchparam
}