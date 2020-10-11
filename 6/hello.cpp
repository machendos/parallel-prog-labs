#include <stdio.h>
#include <omp.h>
#include <iostream>
#include <atomic>
#include <cstddef>
#include <valarray>
#include <mpi.h>
using namespace std;

int main(int argc, char *argv[])
{

  int rank, threadCount;
  MPI_Init(&argc, &argv);
  MPI_Comm_size(MPI_COMM_WORLD, &threadCount);
  MPI_Comm_rank(MPI_COMM_WORLD, &rank);
  MPI_Status status;

  int VECTOR_SIZE_PER_TREAD = 10;

  if (rank == 0)
  {

    int MAX = 100;
    int MIN = 0;

    int workerCount = threadCount - 1;

    int vectorSize = VECTOR_SIZE_PER_TREAD * workerCount;

    int vector1[vectorSize];
    int vector2[vectorSize];

    srand(time(NULL));

    for (int index = 0; index < vectorSize; index++)
    {
      vector1[index] = rand() % (MAX - MIN) + MIN;
      vector2[index] = rand() % (MAX - MIN) + MIN;
    }

    long sequenced = 0;

    for (int i = 0; i < vectorSize; i++)
    {
      sequenced += vector1[i] * vector2[i];
    }
    printf("SEQUENCED: %d\n", sequenced);

    int result[3];

    for (int currThreadIndex = 0; currThreadIndex < workerCount; currThreadIndex++)
    {
      int step = currThreadIndex * VECTOR_SIZE_PER_TREAD;
      int vector1Part[VECTOR_SIZE_PER_TREAD];
      std::copy(vector1 + step, vector1 + (currThreadIndex + 1) * VECTOR_SIZE_PER_TREAD, vector1Part);
      int vector2Part[VECTOR_SIZE_PER_TREAD];
      std::copy(vector2 + step, vector2 + (currThreadIndex + 1) * VECTOR_SIZE_PER_TREAD, vector2Part);

      MPI_Send(vector1Part, VECTOR_SIZE_PER_TREAD, MPI_INT, currThreadIndex + 1, 10, MPI_COMM_WORLD);
      MPI_Send(vector2Part, VECTOR_SIZE_PER_TREAD, MPI_INT, currThreadIndex + 1, 10, MPI_COMM_WORLD);
    }
    MPI_Recv(result, 1, MPI_INT, 1, 10, MPI_COMM_WORLD, &status);
    MPI_Recv(result + 1, 1, MPI_INT, 2, 10, MPI_COMM_WORLD, &status);
    MPI_Recv(result + 2, 1, MPI_INT, 3, 10, MPI_COMM_WORLD, &status);
    printf("PARALLEL: %d\n", result[0] + result[1] + result[2]);
  }
  else
  {
    int vector1[VECTOR_SIZE_PER_TREAD];
    int vector2[VECTOR_SIZE_PER_TREAD];
    MPI_Recv(vector1, VECTOR_SIZE_PER_TREAD, MPI_INT, 0, 10, MPI_COMM_WORLD, &status);
    MPI_Recv(vector2, VECTOR_SIZE_PER_TREAD, MPI_INT, 0, 10, MPI_COMM_WORLD, &status);
    std::atomic<int>
        sharedValue(0);

    int result[1];
    result[0] = 0;
    long safed = 0;
#pragma omp parallel for
    for (int i = 0; i < VECTOR_SIZE_PER_TREAD; i++)
    {
      result[0] += vector1[i] * vector2[i];
      sharedValue.fetch_add(vector1[i] * vector2[i]);
    }
    MPI_Send(result, 1, MPI_INT, 0, 10, MPI_COMM_WORLD);
  }

  MPI_Finalize();
  return 0;
}
