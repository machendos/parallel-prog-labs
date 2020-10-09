import java.util.Arrays;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.IntStream;

public class Mainn {

  public static void main(String[] args) throws InterruptedException, ExecutionException {
    
    final int ARRAYS_LENGTH = (int) Math.pow(10, 5);
    final int ELEMENT_MIN = 1;
    final int ELEMENT_MAX = 10000;

    CompletableFuture<int[]> firstArrayProcess = CompletableFuture.supplyAsync(() -> {

      int[] array = new int[ARRAYS_LENGTH];
      for (int index = 0; index < array.length; index++) {
        array[index] = Math.round((float) Math.random() * ELEMENT_MAX) - ELEMENT_MIN;
      }

      int halfMax = Arrays.stream(array).max().orElse(0) / 2;

      int[] filtered = Arrays
        .stream(array)
        .filter(element -> element > halfMax)
        .sorted()
        .toArray();

      return filtered;
    });

    CompletableFuture<int[]> secondArrayProcess = CompletableFuture.supplyAsync(() -> {
      int[] array = new int[ARRAYS_LENGTH];
      for (int index = 0; index < array.length; index++) {

        array[index] = Math.round((float) Math.random() * ELEMENT_MAX) - ELEMENT_MIN;
      }
      int[] filtered = Arrays
        .stream(array)
        .filter(element -> element % 2 == 0)
        .sorted()
        .toArray();

      return filtered;
    });

    CompletableFuture<int[]> combinedFuture = firstArrayProcess.thenCombine(secondArrayProcess,
        (firstArrayFiltered, secondArrayFiltered) -> {

          int[] finalFiltered = Arrays
            .stream(secondArrayFiltered)
            .filter(element ->
              !IntStream.of(firstArrayFiltered).anyMatch(x -> x == element)
            )
            .toArray();
          return finalFiltered;
        }
      );

    combinedFuture.get();
  }

}
