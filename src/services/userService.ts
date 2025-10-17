export const getTosEur = async (customerId) => {
  try {
    const response = await fetch(`${process.env.SPHERE_API_URL}/customer/${customerId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.SPHERE_API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("eurTos", result.data.customer);
    return result.data.customer.euAccountTos;

  } catch (error) {
    console.error('Error:', error);
  }
}