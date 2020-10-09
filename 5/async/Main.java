import java.util.Arrays;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

public class Main {

  public static void main(String[] args) throws InterruptedException, ExecutionException {

    final int ARRAYS_LENGTH = (int) Math.pow(10, 1);
    final int ELEMENT_MIN = 1;
    final int ELEMENT_MAX = 1000;

    CompletableFuture<int[]> term = CompletableFuture.supplyAsync(() -> {

      int[] array = new int[ARRAYS_LENGTH];
      for (int index = 0; index < array.length; index++) {
        array[index] = Math.round((float) Math.random() * ELEMENT_MAX) - ELEMENT_MIN;
      }
      for (int element : array) {
        System.out.println(element);
      }

      System.out.println("--");
      int max = Arrays.stream(array).max().orElse(0);
      System.out.println(max);
      System.out.println("--");

      return new int[4];
    });

    term.get();

  }

}
