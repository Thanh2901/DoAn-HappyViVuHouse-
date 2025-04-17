package org.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MyFileNotFoundException extends RuntimeException{
    public MyFileNotFoundException(String msg) { super(msg);}
    public MyFileNotFoundException(String msg, Throwable cause) { super(msg, cause); }
}
