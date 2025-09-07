import { fetchCars } from "@utils";
import { HomeProps } from "@types";
import { fuels, yearsOfProduction } from "@constants";
import { CarCard, ShowMore, SearchBar, CustomFilter, Hero } from "@components";

export default async function Home({ searchParams }: HomeProps) {
  // Normalize values from searchParams (they may be strings or undefined)
  const year = searchParams.year ? Number(searchParams.year) : 2022;
  const limitForUI = searchParams.limit ? Number(searchParams.limit) : 10; // default for pagination UI only

  // Build filters but only include `limit` and `year` when explicitly provided to avoid over-filtering or premium params
  const filters: Record<string, any> = {
    manufacturer: searchParams.manufacturer || "",
    fuel: searchParams.fuel || "",
    model: searchParams.model || "",
  };

  // Only include year in the API call if the user set it (avoid defaulting to 2022 which narrows results)
  if (searchParams.year) {
    filters.year = Number(searchParams.year);
  }

  if (searchParams.limit) {
    filters.limit = Number(searchParams.limit);
  }

  const allCars = await fetchCars(filters);

  const isDataEmpty = !Array.isArray(allCars) || allCars.length < 1 || !allCars;

  return (
    <main className='overflow-hidden'>
      <Hero />

      <div className='mt-12 padding-x padding-y max-width' id='discover'>
        <div className='home__text-container'>
          <h1 className='text-4xl font-extrabold'>Car Catalogue</h1>
          <p>Explore out cars you might like</p>
        </div>

        <div className='home__filters'>
          <SearchBar />

          <div className='home__filter-container'>
            <CustomFilter title='fuel' options={fuels} />
            <CustomFilter title='year' options={yearsOfProduction} />
          </div>
        </div>

        {!isDataEmpty ? (
          <section>
            <div className='home__cars-wrapper'>
              {allCars?.map((car: any) => (
                <CarCard key={`${car.make}-${car.model}-${car.year}`} car={car} />
              ))}
            </div>

            <ShowMore
              pageNumber={(searchParams.limit || 10) / 10}
              isNext={(searchParams.limit || 10) > allCars.length}
            />
          </section>
        ) : (
          <div className='home__error-container'>
            <h2 className='text-black text-xl font-bold'>Oops, no results</h2>
            <p>{allCars?.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
