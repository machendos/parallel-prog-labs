#include <stdio.h>
#include <omp.h>
#include <atomic>
#include <iostream>
using namespace std;

int main(int argc, char **argv)
{

  int VECTOR_SIZE = 100;
  int MAX = 100;
  int MIN = 0;

  int vector1[VECTOR_SIZE];
  int vector2[VECTOR_SIZE];

  srand(static_cast<unsigned int>(time(0)));

  for (int index = 0; index < VECTOR_SIZE; index++)
  {
    vector1[index] = rand() % (MAX - MIN) + MIN;
    vector2[index] = rand() % (MAX - MIN) + MIN;
  }

  long sequenced = 0;

  for (int i = 0; i < VECTOR_SIZE; i++)
  {
    sequenced += vector1[i] * vector2[i];
  }

  printf("SEQUENCED: %d  \n", sequenced);

  long unsafed = 0;

  std::atomic<int> sharedValue(0);
#pragma omp parallel for
  for (int i = 0; i < VECTOR_SIZE; i++)
  {
    unsafed += vector1[i] * vector2[i];
    sharedValue.fetch_add(vector1[i] * vector2[i]);
  }

  printf("UNSAFED: %d  \n", unsafed);
  printf("SAFED: %d  \n", sharedValue.load());

  return 0;
}
