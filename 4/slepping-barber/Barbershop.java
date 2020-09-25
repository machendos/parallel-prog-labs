
import java.util.ArrayDeque;
import java.util.concurrent.atomic.AtomicInteger;

public class Barbershop {

  int queueSize;
  int haircutTime;

  public Barbershop(int waitingRumSize, int haircutTime) {
    this.queueSize = waitingRumSize;
    this.haircutTime = haircutTime;
  }

  public AtomicInteger currClients = new AtomicInteger();
  Object barberMutex = new Object();

  public ArrayDeque<Client> waitingRoom = new ArrayDeque<Client>();
}
